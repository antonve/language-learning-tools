package main

import (
	"fmt"
	"os"

	"github.com/antonve/language-learning-tools/internal/pkg/german/lemmatizer"
)

func main() {
	lemmatizer := lemmatizer.NewGermanLemmatizer()

	if len(os.Args) <= 1 {
		fmt.Println("No word supplied")
		return
	}

	results := lemmatizer.Lemmas(os.Args[1])
	if len(results) == 0 {
		fmt.Println("no lemma found")
		return
	}

	fmt.Println(results)
}
