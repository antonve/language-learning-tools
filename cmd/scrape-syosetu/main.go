package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

func main() {
	series := "n6316bn"
	start := 1
	end := 2 // 304

	chapters := downloadChapters(series, start, end)
	_ = WriteChapters(chapters, "./out/"+series)
}

type Chapter struct {
	URL   string
	Title string
	Body  string
}

func downloadChapters(series string, start, end int) []Chapter {
	wg := &sync.WaitGroup{}

	for i := start; i <= end; i++ {
		wg.Add(1)

		if i%10 == 0 {
			time.Sleep(1 * time.Second)
		}

		go func(idx int) {
			url := urlFor(series, idx)
			fmt.Println("fetching " + url)
			body := fetch(url)
			fmt.Println(body)
			wg.Done()
		}(i)
	}

	wg.Wait()

	return nil
}

func fetch(url string) string {
	response, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		panic(err)
	}

	return string(body)
}

func urlFor(series string, chapterIndex int) string {
	return fmt.Sprintf("https://ncode.syosetu.com/%s/%d/", series, chapterIndex)
}

func WriteChapters(chapters []Chapter, path string) error {
	return nil
}
