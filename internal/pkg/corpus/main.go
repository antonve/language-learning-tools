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
	FindOriginal(series, filename string) (*Chapter, error)
}

type corpus struct {
	chapters []*Chapter
}

var ErrChapterNotFound = errors.New("could not find chapter")

func New(path string) (cor Corpus, err error) {
	chapters, err := loadSeries(path)

	if err != nil {
		return nil, err
	}

	maxOpenFiles := int64(25)
	sem := semaphore.NewWeighted(maxOpenFiles)

	wg := &sync.WaitGroup{}
	for _, c := range chapters {
		wg.Add(1)
		err = sem.Acquire(context.Background(), 1)
		if err != nil {
			return
		}

		go func(ch *Chapter) {
			defer sem.Release(1)
			defer wg.Done()

			err = ch.Load()
			if err != nil {
				return
			}
		}(c)
	}

	wg.Wait()

	return &corpus{chapters: chapters}, err
}

func (c *corpus) FindOriginal(series, filename string) (*Chapter, error) {
	for _, ch := range c.chapters {
		if ch.Series == series && ch.Filename == filename {
			return ch, nil
		}
	}

	return nil, ErrChapterNotFound
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

		c := NewChapter(series, fp, f.Name())
		chapters = append(chapters, c)
	}

	return chapters, nil
}

type Chapter struct {
	Series   string
	Path     string
	Filename string

	body  string
	title string
}

func NewChapter(series, path, filename string) *Chapter {
	c := &Chapter{
		Series:   series,
		Path:     path,
		Filename: filename,
	}

	return c
}

func (c *Chapter) Body() string {
	return c.body
}

func (c *Chapter) BodyWithoutTitle() string {
	arr := strings.Split(c.body, "\n")[1:]
	return strings.Join(arr, "\n")
}

func (c *Chapter) Title() string {
	return c.title
}

func (c *Chapter) Load() error {
	body, err := os.ReadFile(c.Path)
	if err != nil {
		return errors.Wrap(err, "could not load body for chapter: "+c.Path)
	}
	c.body = string(body)

	scanner := bufio.NewScanner(strings.NewReader(c.Body()))
	scanner.Scan()
	c.title = scanner.Text()

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
