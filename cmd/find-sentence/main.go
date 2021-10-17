package main

import (
	"flag"
	"fmt"

	"github.com/antonve/jp-mining-tools/internal/pkg/corpus"
)

func main() {
	var word string
	var path string

	flag.StringVar(&word, "word", "です", "the word to search for")
	flag.StringVar(&path, "path", "./out", "the path in which to look for files")

	flag.Parse()

	corpus, err := corpus.New(path)
	if err != nil {
		panic(err)
	}

	results := corpus.Search(word)

	for _, res := range results {
		fmt.Println(res.Chapter.Path, res.Line)
	}
}
