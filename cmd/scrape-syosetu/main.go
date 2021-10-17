package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/antchfx/htmlquery"
)

func main() {
	series := "n6316bn"
	start := 1
	end := 10 // 304

	generator := func(done <-chan interface{}, start, end int) <-chan string {
		stream := make(chan string)
		go func() {
			defer close(stream)
			for i := start; i <= end; i++ {
				select {
				case <-done:
					return
				case stream <- urlFor(series, i):
				}
			}
		}()

		return stream
	}

	backoff := func(
		done <-chan interface{},
		urlStream <-chan string,
		timeout time.Duration,
		per int,
	) <-chan string {
		stream := make(chan string)
		counter := 0
		go func() {
			defer close(stream)
			for url := range urlStream {
				if counter%per == 0 {
					time.Sleep(timeout)
				}
				counter++

				select {
				case <-done:
					return
				case stream <- url:
				}
			}
		}()

		return stream
	}

	download := func(
		done <-chan interface{},
		urlStream <-chan string,
	) <-chan RawChapter {
		stream := make(chan RawChapter)
		go func() {
			defer close(stream)
			for url := range urlStream {
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

	urlStream := generator(done, start, end)
	pipeline := normalize(done, download(done, backoff(done, urlStream, 1*time.Second, 3)))

	for v := range pipeline {
		fmt.Println(v.URL+": "+v.Title, v.Length())
	}
}

func normalizeChapter(raw RawChapter) Chapter {
	c := Chapter{URL: raw.URL}

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
	URL   string
	Title string
	Body  string
}

func (c Chapter) Length() int {
	return len(c.Body)
}

type RawChapter struct {
	URL  string
	Body string
}

func fetch(url string) RawChapter {
	response, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		panic(err)
	}

	return RawChapter{
		URL:  url,
		Body: string(body),
	}
}

func urlFor(series string, chapterIndex int) string {
	return fmt.Sprintf("https://ncode.syosetu.com/%s/%d/", series, chapterIndex)
}
