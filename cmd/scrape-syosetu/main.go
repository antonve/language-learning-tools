package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	series := "n6316bn"
	start := 1
	end := 304 // 304

	chapters := downloadChapters(series, start, end)
	WriteChapters(chapters, "./out/"+series)
}

type Chapter struct {
	URL   string
	Title string
	Body  string
}

func downloadChapters(series string, start, end int) []Chapter {
	wg := &sync.WaitGroup{}

	for i := start; i <= end; i++ {
		if i%10 == 0 {
			time.Sleep(1 * time.Second)
		}

		go func(idx int) {
			wg.Add(1)
			url := urlFor(series, idx)
			fmt.Println(url)
			wg.Done()
		}(i)
	}

	return nil
}

func urlFor(series string, chapterIndex int) string {
	return fmt.Sprintf("https://ncode.syosetu.com/%s/%d/", series, chapterIndex)
}

func WriteChapters(chapters []Chapter, path string) error {
	return nil
}
