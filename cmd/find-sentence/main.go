package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/pkg/errors"
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
		fmt.Println(c.Series, ": ", c.Path)
	}
}

func loadSeries(path string) ([]Chapter, error) {
	folders, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, errors.Wrap(err, "failed to load series folder")
	}

	chapters := []Chapter{}

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

func loadChapters(series string, path string) ([]Chapter, error) {
	files, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read directory for series: "+series)
	}

	chapters := []Chapter{}

	for _, f := range files {
		fp := fmt.Sprintf("%s/%s", path, f.Name())

		if filepath.Ext(fp) != ".txt" {
			continue
		}

		c := Chapter{
			Path:   fp,
			Series: series,
		}

		chapters = append(chapters, c)
	}

	return chapters, nil
}

type Chapter struct {
	Series string
	Path   string
}
