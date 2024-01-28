package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/aaaton/golem/v4"
	"github.com/aaaton/golem/v4/dicts/de"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
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

	results := []string{}

	if found := lemmatizer.InDict(input); found {
		words := lemmatizer.Lemmas(input)
		results = append(results, words...)
	}

	inputWithEszett := strings.ReplaceAll(input, "ss", "ß")
	if found := lemmatizer.InDict(inputWithEszett); found && inputWithEszett != input {
		words := lemmatizer.Lemmas(inputWithEszett)
		results = append(results, words...)
	}

	results = formatResults(results)

	if len(results) == 0 {
		fmt.Println("no lemma found")
		return
	}

	fmt.Println(results)
}

var caser = cases.Title(language.German)

func formatResults(results []string) []string {
	newResults := map[string]bool{}

	for _, word := range results {
		if _, ok := newResults[word]; ok {
			withCaps := caser.String(strings.ToLower(word))
			if _, ok := newResults[withCaps]; !ok {
				newResults[withCaps] = true
			}
		} else {
			newResults[word] = true
		}
	}

	keys := make([]string, len(newResults))

	i := 0
	for k := range newResults {
		keys[i] = k
		i++
	}

	return keys
}
