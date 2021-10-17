package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
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
	) <-chan string {
		stream := make(chan string)
		counter := 0
		go func() {
			defer close(stream)
			for url := range urlStream {
				if counter%3 == 0 {
					time.Sleep(1 * time.Second)
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

	done := make(chan interface{})
	defer close(done)

	urlStream := generator(done, start, end)
	pipeline := download(done, backoff(done, urlStream))

	for v := range pipeline {
		fmt.Println(v.URL + ": ")
	}
}

type Chapter struct {
	URL   string
	Title string
	Body  string
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
