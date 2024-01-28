package main

import (
	"fmt"
	"os"

	"github.com/aaaton/golem/v4"
	"github.com/aaaton/golem/v4/dicts/de"
)

func main() {
	lemmatizer, err := golem.New(de.New())
	if err != nil {
		panic(err)
	}

	if len(os.Args) <= 1 {
		fmt.Println("No word supplied")
		return
	}

	input := os.Args[1]

	word := lemmatizer.Lemma(input)
	fmt.Println(word)
}
