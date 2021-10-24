package goo

import (
	"net/url"
	"strings"

	"github.com/antchfx/htmlquery"
	"github.com/pkg/errors"
)

type Goo interface {
	Search(word string) (*Result, error)
}

type goo struct {
}

func New() Goo {
	return &goo{}
}

func (j *goo) Search(word string) (*Result, error) {
	doc, err := htmlquery.LoadURL("https://dictionary.goo.ne.jp/word/" + url.QueryEscape(word) + "/")
	if err != nil {
		return nil, errors.Wrap(err, "failed to load")
	}

	defElement := htmlquery.FindOne(doc, "//div[contains(@class, \"meaning_area\")]")
	def := htmlquery.InnerText(defElement)
	def = strings.TrimSpace(def)

	readingElement := htmlquery.FindOne(doc, "//span[@class=\"yomi\"]")
	reading := htmlquery.InnerText(readingElement)
	reading = strings.TrimSuffix(reading, "）")
	reading = strings.TrimPrefix(reading, "（")

	res := &Result{
		Word:       word,
		Reading:    reading,
		Definition: def,
	}

	return res, nil
}

type Result struct {
	Word       string
	Reading    string
	Definition string
}
