package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"

	"github.com/antonve/jp-mining-tools/internal/pkg/corpus"
	"github.com/antonve/jp-mining-tools/internal/pkg/goo"
	"github.com/antonve/jp-mining-tools/internal/pkg/jisho"
)

func main() {
	api := NewAPI()

	e := echo.New()
	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("/corpus/:token", api.SearchCorpus)
	e.GET("/series/:series/:filename", api.GetChapter)
	e.GET("/jisho/:token", api.JishoProxy)
	e.GET("/goo/:token", api.GooProxy)

	e.Logger.Fatal(e.Start(":5555"))
}

type API interface {
	SearchCorpus(c echo.Context) error
	GetChapter(c echo.Context) error
	JishoProxy(c echo.Context) error
	GooProxy(c echo.Context) error
}

type api struct {
	corpus corpus.Corpus
	jisho  jisho.Jisho
	goo    goo.Goo

	jishoCache map[string]*JishoProxyResponse
}

func NewAPI() API {
	c, err := corpus.New("./out")
	if err != nil {
		panic(err)
	}

	jishoCache := map[string]*JishoProxyResponse{}

	return &api{corpus: c, jisho: jisho.New(), goo: goo.New(), jishoCache: jishoCache}
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
	Results []SearchResult `json:"results"`
}

type SearchResult struct {
	Filename string `json:"filename"`
	Series   string `json:"series"`
	Chapter  string `json:"chapter"`
	Line     string `json:"line"`
}

func (api *api) GetChapter(c echo.Context) error {
	series := c.Param("series")
	filename := c.Param("filename")
	chapter, err := api.corpus.FindOriginal(series, filename)

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

func (api *api) JishoProxy(c echo.Context) error {
	token := c.Param("token")

	if response, ok := api.jishoCache[token]; ok {
		return c.JSON(http.StatusOK, response)
	}

	res, err := api.jisho.Search(token)

	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	response := JishoProxyResponse{
		Word:        token,
		Definitions: make([]JishoProxyDefinition, len(res.Definitions)),
	}

	for i, d := range res.Definitions {
		response.Definitions[i] = JishoProxyDefinition{Meaning: d.Meaning}
	}

	api.jishoCache[token] = &response

	return c.JSON(http.StatusOK, response)
}

type JishoProxyResponse struct {
	Word        string                 `json:"word"`
	Definitions []JishoProxyDefinition `json:"definitions"`
}

type JishoProxyDefinition struct {
	Meaning string `json:"meaning"`
}

func (api *api) GooProxy(c echo.Context) error {
	token := c.Param("token")
	res, err := api.goo.Search(token)

	if err != nil {
		switch errors.Cause(err) {
		case goo.ErrNotFound:
			return c.NoContent(http.StatusNotFound)
		default:
			return c.NoContent(http.StatusInternalServerError)
		}
	}

	response := GooProxyResponse{
		Word:       token,
		Reading:    res.Reading,
		Definition: res.Definition,
	}

	return c.JSON(http.StatusOK, response)
}

type GooProxyResponse struct {
	Word       string `json:"word"`
	Reading    string `json:"reading"`
	Definition string `json:"definition"`
}
