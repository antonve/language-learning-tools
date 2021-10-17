package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"

	"github.com/pkg/errors"
	"golang.org/x/sync/semaphore"
)

func main() {
	var word string
	var path string

	flag.StringVar(&word, "word", "です", "the word to search for")
	flag.StringVar(&path, "path", "./out", "the path in which to look for files")

	flag.Parse()

	chapters, err := loadSeries(path)

	if err != nil {
		panic(err)
	}

	for _, c := range chapters {
		fmt.Println(c.Path)
	}

	maxOpenFiles := int64(25)
	sem := semaphore.NewWeighted(maxOpenFiles)

	wg := &sync.WaitGroup{}
	for _, c := range chapters {
		wg.Add(1)
		sem.Acquire(context.Background(), 1)

		go func(ch *Chapter) {
			err := ch.Load()
			if err != nil {
				panic(err)
			}
			fmt.Printf("loaded chapter %s:\n%s\n", c.Path, c.Body())
			sem.Release(1)
			wg.Done()
		}(c)
	}

	wg.Wait()
}

func loadSeries(path string) ([]*Chapter, error) {
	folders, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, errors.Wrap(err, "failed to load series folder")
	}

	chapters := []*Chapter{}

	for _, f := range folders {
		if !f.IsDir() {
			continue
		}

		seriesPath := fmt.Sprintf("%s/%s", path, f.Name())
		c, err := loadChapters(f.Name(), seriesPath)

		if err != nil {
			return nil, errors.Wrap(err, "failed to load chapters for series: "+seriesPath)
		}

		chapters = append(chapters, c...)
	}

	return chapters, nil
}

func loadChapters(series string, path string) ([]*Chapter, error) {
	files, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read directory for series: "+series)
	}

	chapters := []*Chapter{}

	for _, f := range files {
		fp := fmt.Sprintf("%s/%s", path, f.Name())

		if filepath.Ext(fp) != ".txt" {
			continue
		}

		c := NewChapter(series, fp)
		chapters = append(chapters, c)
	}

	return chapters, nil
}

type Chapter struct {
	Series string
	Path   string

	body string
}

func NewChapter(series, path string) *Chapter {
	c := &Chapter{
		Series: series,
		Path:   path,
	}

	return c
}

func (c *Chapter) Body() string {
	return c.body
}

func (c *Chapter) Load() error {
	body, err := os.ReadFile(c.Path)
	if err != nil {
		return errors.Wrap(err, "could not load body for chapter: "+c.Path)
	}
	c.body = string(body)
	return nil
}
