package main

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/antonve/jp-mining-tools/internal/pkg/corpus"
)

func main() {
	api := NewAPI()

	e := echo.New()

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("/corpus/:token", api.SearchCorpus)

	e.Logger.Fatal(e.Start(":5555"))
}

type API interface {
	SearchCorpus(c echo.Context) error
}

type api struct {
	corpus corpus.Corpus
}

func NewAPI() API {
	c, err := corpus.New("./out")
	if err != nil {
		panic(err)
	}

	return &api{corpus: c}
}

func (api *api) SearchCorpus(c echo.Context) error {
	token := c.Param("token")
	res := api.corpus.Search(token)
	results := make([]SearchResult, len(res))

	for i, r := range res {
		results[i] = SearchResult{
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
	Results []SearchResult
}

type SearchResult struct {
	Filename string `json:"filename"`
	Series   string `json:"series"`
	Chapter  string `json:"chapter"`
	Line     string `json:"line"`
}
