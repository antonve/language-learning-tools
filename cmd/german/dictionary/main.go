package main

import (
	"fmt"
	"os"

	"github.com/aaaton/golem/v4"
	"github.com/aaaton/golem/v4/dicts/de"
)

func main() {
	if len(os.Args) <= 1 {
		fmt.Println("No word supplied")
		return
	}

	input := os.Args[1]

	lemmatizer, err := golem.New(de.New())
	if err != nil {
		panic(err)
	}

	headword := lemmatizer.Lemma(input)
	fmt.Println(headword)
}
