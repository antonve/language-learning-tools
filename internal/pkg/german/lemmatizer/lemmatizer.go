package lemmatizer

import (
	"strings"

	"github.com/aaaton/golem/v4"
	"github.com/aaaton/golem/v4/dicts/de"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type GermanLemmatizer struct {
	lemmatizer *golem.Lemmatizer
}

func NewGermanLemmatizer() *GermanLemmatizer {
	lemmatizer, err := golem.New(de.New())
	if err != nil {
		panic(err)
	}

	return &GermanLemmatizer{
		lemmatizer: lemmatizer,
	}
}

func (l *GermanLemmatizer) Lemmas(input string) []string {
	results := []string{}

	if found := l.lemmatizer.InDict(input); found {
		words := l.lemmatizer.Lemmas(input)
		results = append(results, words...)
	}

	inputWithEszett := strings.ReplaceAll(input, "ss", "ß")
	if found := l.lemmatizer.InDict(inputWithEszett); found && inputWithEszett != input {
		words := l.lemmatizer.Lemmas(inputWithEszett)
		results = append(results, words...)
	}

	results = formatResults(results)

	return results
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
