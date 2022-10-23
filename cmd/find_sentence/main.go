package main

import (
	"flag"
	"fmt"

	"github.com/antonve/jp-mining-tools/internal/pkg/corpus"
)

func main() {
	var word string
	var path string
	var language string

	flag.StringVar(&word, "word", "です", "the word to search for")
	flag.StringVar(&path, "path", "./out", "the path in which to look for files")
	flag.StringVar(&language, "language", "ja", "the language of the corpus to search")

	flag.Parse()

	corpus, err := corpus.New(path, language)
	if err != nil {
		panic(err)
	}

	results := corpus.Search(word)

	for _, res := range results {
		fmt.Println(res.Chapter.Series, res.Chapter.Title(), res.Line)
	}
}
