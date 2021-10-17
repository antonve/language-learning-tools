package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/antchfx/htmlquery"
)

func main() {
	var series string
	var start int
	var end int

	flag.StringVar(&series, "series", "n6316bn", "the code of a series")
	flag.IntVar(&start, "start", 1, "the starting chapter")
	flag.IntVar(&end, "end", 10, "the ending chapter")

	flag.Parse()

	generator := func(done <-chan interface{}, start, end int) <-chan RawChapter {
		stream := make(chan RawChapter)
		go func() {
			defer close(stream)
			for i := start; i <= end; i++ {
				select {
				case <-done:
					return
				case stream <- NewRawChapter(series, i):
				}
			}
		}()

		return stream
	}

	backoff := func(
		done <-chan interface{},
		chapterStream <-chan RawChapter,
		timeout time.Duration,
		per int,
	) <-chan RawChapter {
		stream := make(chan RawChapter)
		counter := 0
		go func() {
			defer close(stream)
			for chapter := range chapterStream {
				if counter%per == 0 {
					time.Sleep(timeout)
				}
				counter++

				select {
				case <-done:
					return
				case stream <- chapter:
				}
			}
		}()

		return stream
	}

	download := func(
		done <-chan interface{},
		chapterStream <-chan RawChapter,
	) <-chan RawChapter {
		stream := make(chan RawChapter)
		go func() {
			defer close(stream)
			for url := range chapterStream {
				select {
				case <-done:
					return
				case stream <- fetch(url):
				}
			}
		}()

		return stream
	}

	normalize := func(
		done <-chan interface{},
		chapterStream <-chan RawChapter,
	) <-chan Chapter {
		stream := make(chan Chapter)
		go func() {
			defer close(stream)
			for raw := range chapterStream {
				select {
				case <-done:
					return
				case stream <- normalizeChapter(raw):
				}
			}
		}()

		return stream
	}

	done := make(chan interface{})
	defer close(done)

	chapterStream := generator(done, start, end)
	pipeline := normalize(done, download(done, backoff(done, chapterStream, 1*time.Second, 3)))

	for v := range pipeline {
		fmt.Println(v.URL+": "+v.Title, v.Length())
		save("./out", v)
	}
}

func save(path string, chapter Chapter) {
	filePath := fmt.Sprintf("%s/%05d.txt", path, chapter.Index)
	err := os.WriteFile(filePath, chapter.Serialize(), 0644)
	if err != nil {
		panic(err)
	}
}

func normalizeChapter(raw RawChapter) Chapter {
	c := Chapter{URL: raw.URL, Index: raw.Index}

	doc, err := htmlquery.Parse(strings.NewReader(raw.Body))
	if err != nil {
		panic(err)
	}

	title := htmlquery.FindOne(doc, "//p[@class=\"novel_subtitle\"]")
	c.Title = htmlquery.InnerText(title)

	body := htmlquery.FindOne(doc, "//div[@id=\"novel_honbun\"]")
	c.Body = htmlquery.InnerText(body)

	return c
}

type Chapter struct {
	Index int
	URL   string
	Title string
	Body  string
}

func (c Chapter) Length() int {
	return len(c.Body)
}

func (c Chapter) Serialize() []byte {
	return []byte(fmt.Sprintf("%s\n\n%s", c.Title, c.Body))
}

type RawChapter struct {
	Index int
	URL   string
	Body  string
}

func fetch(raw RawChapter) RawChapter {
	response, err := http.Get(raw.URL)
	if err != nil {
		panic(err)
	}

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		panic(err)
	}

	return RawChapter{
		URL:   raw.URL,
		Index: raw.Index,
		Body:  string(body),
	}
}

func NewRawChapter(series string, chapterIndex int) RawChapter {
	return RawChapter{
		URL:   fmt.Sprintf("https://ncode.syosetu.com/%s/%d/", series, chapterIndex),
		Index: chapterIndex,
	}
}
