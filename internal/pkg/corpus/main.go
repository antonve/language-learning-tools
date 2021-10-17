package corpus

import (
	"bufio"
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/pkg/errors"
	"golang.org/x/sync/semaphore"
)

type Corpus interface {
	Search(word string) []*Result
}

type corpus struct {
	chapters []*Chapter
}

func New(path string) (cor Corpus, err error) {
	chapters, err := loadSeries(path)

	if err != nil {
		return nil, err
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
			err = ch.Load()
			if err != nil {
				return
			}
			sem.Release(1)
			wg.Done()
		}(c)
	}

	wg.Wait()

	return &corpus{chapters: chapters}, err
}

func (c *corpus) Search(word string) []*Result {
	maxConcurrentSearches := int64(100)
	sem := semaphore.NewWeighted(maxConcurrentSearches)
	mu := sync.RWMutex{}

	results := []*Result{}

	wg := &sync.WaitGroup{}
	for _, c := range c.chapters {
		wg.Add(1)
		sem.Acquire(context.Background(), 1)

		go func(ch *Chapter) {
			res := ch.Find(word)
			mu.Lock()
			results = append(results, res...)
			mu.Unlock()
			sem.Release(1)
			wg.Done()
		}(c)
	}

	wg.Wait()

	return results
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

func (c *Chapter) Find(word string) []*Result {
	scanner := bufio.NewScanner(strings.NewReader(c.Body()))
	results := []*Result{}

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, word) {
			result := &Result{
				Line:    line,
				Chapter: c,
			}
			results = append(results, result)
		}
	}

	return results
}

type Result struct {
	Line    string
	Chapter *Chapter
}
