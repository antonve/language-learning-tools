package controllers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/antonve/language-learning-tools/internal/pkg/corpus"
)

type CorpusAPI interface {
	Search(c echo.Context) error
	GetChapter(c echo.Context) error
}

type corpusAPI struct {
	jpCorpus corpus.Corpus
	zhCorpus corpus.Corpus
}

func NewCorpusAPI(jpc, zhc corpus.Corpus) CorpusAPI {
	return &corpusAPI{
		jpCorpus: jpc,
		zhCorpus: zhc,
	}
}

func (api *corpusAPI) getCorpus(lang string) (corpus.Corpus, error) {
	switch lang {
	case "jp":
		return api.jpCorpus, nil
	case "zh":
		return api.zhCorpus, nil
	}

	return nil, fmt.Errorf("no corpus found for language %s", lang)
}

func (api *corpusAPI) Search(c echo.Context) error {
	token := c.Param("token")
	cor, err := api.getCorpus(c.Param("lang"))
	if err != nil {
		return err
	}

	res := cor.Search(token)
	results := make([]SearchResult, len(res))

	for i, r := range res {
		results[i] = SearchResult{
			Language: r.Chapter.Language,
			Filename: r.Chapter.Filename,
			Series:   r.Chapter.Series,
			Chapter:  r.Chapter.Title(),
			Line:     r.Line,
		}
	}

	response := SearchCorpusResponse{Results: results}

	return c.JSON(http.StatusOK, response)
}

type SearchCorpusResponse struct {
	Results []SearchResult `json:"results"`
}

type SearchResult struct {
	Language string `json:"language"`
	Filename string `json:"filename"`
	Series   string `json:"series"`
	Chapter  string `json:"chapter"`
	Line     string `json:"line"`
}

func (api *corpusAPI) GetChapter(c echo.Context) error {
	series := c.Param("series")
	filename := c.Param("filename")
	cor, err := api.getCorpus(c.Param("lang"))
	if err != nil {
		return err
	}

	chapter, err := cor.FindOriginal(series, filename)

	if err != nil {
		switch errors.Cause(err) {
		case corpus.ErrChapterNotFound:
			return c.NoContent(http.StatusNotFound)
		default:
			return c.NoContent(http.StatusInternalServerError)
		}
	}

	response := GetChapterResponse{
		Filename: chapter.Filename,
		Series:   chapter.Series,
		Title:    chapter.Title(),
		Body:     chapter.BodyWithoutTitle(),
	}

	return c.JSON(http.StatusOK, response)
}

type GetChapterResponse struct {
	Filename string `json:"filename"`
	Series   string `json:"series"`
	Title    string `json:"title"`
	Body     string `json:"body"`
}
