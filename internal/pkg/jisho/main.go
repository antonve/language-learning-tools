package jisho

import (
	"net/url"

	"github.com/antchfx/htmlquery"
	"github.com/pkg/errors"
)

type Jisho interface {
	Search(word string) (*Result, error)
}

type jisho struct {
}

func New() Jisho {
	return &jisho{}
}

func (j *jisho) Search(word string) (*Result, error) {
	doc, err := htmlquery.LoadURL("https://jisho.org/search/" + url.QueryEscape(word))
	if err != nil {
		return nil, errors.Wrap(err, "failed to load")
	}

	words, err := htmlquery.QueryAll(doc, "//div[@class=\"meanings-wrapper\"][1]//span[@class=\"meaning-meaning\"]")
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse")
	}

	defs := make([]Definition, len(words))
	for i, meaning := range words {
		defs[i] = Definition{
			Meaning: htmlquery.InnerText(meaning),
		}
	}

	res := &Result{
		Word:        word,
		Definitions: defs,
	}

	return res, nil
}

type Result struct {
	Word        string
	Definitions []Definition
}

type Definition struct {
	Meaning string
}
