package main

import (
	"bytes"
	"crypto/sha256"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/jcramb/cedict"
	"github.com/kelseyhightower/envconfig"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"

	"github.com/antonve/jp-mining-tools/internal/pkg/corpus"
	"github.com/antonve/jp-mining-tools/internal/pkg/goo"
	"github.com/antonve/jp-mining-tools/internal/pkg/jisho"
	"github.com/antonve/jp-mining-tools/internal/pkg/ocr"
	"github.com/antonve/jp-mining-tools/internal/pkg/persistedcache"
)

func main() {
	api := NewAPI()

	e := echo.New()
	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("/:lang/corpus/:token", api.SearchCorpus)
	e.GET("/:lang/chapter/:series/:filename", api.GetChapter)
	e.GET("/jp/jisho/:token", api.JishoProxy)
	e.GET("/jp/goo/:token", api.GooProxy)
	e.POST("/zh/cedict", api.Cedict)
	e.POST("/ocr", api.OCR)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", api.Config().Port)))
}

type Config struct {
	Postgres struct {
		Host     string `valid:"required"`
		Username string `valid:"required"`
		Password string `valid:"required"`
		Database string `valid:"required"`
		SSLMode  string `valid:"required"`
	}

	Port int `valid:"required"`
}

type API interface {
	SearchCorpus(c echo.Context) error
	GetChapter(c echo.Context) error
	JishoProxy(c echo.Context) error
	GooProxy(c echo.Context) error
	OCR(c echo.Context) error
	Cedict(c echo.Context) error

	Config() Config
}

type api struct {
	config Config

	jpCorpus corpus.Corpus
	zhCorpus corpus.Corpus
	jisho    jisho.Jisho
	goo      goo.Goo
	ocr      ocr.Client

	jishoCache map[string]*JishoProxyResponse
	gooCache   map[string]*GooProxyResponse
	ocrCache   persistedcache.PersistedCache
	cedict     *cedict.Dict
}

func NewAPI() API {
	cfg := Config{}
	envconfig.Process("API", &cfg)

	cjp, err := corpus.New("/app/out", "jp")
	if err != nil {
		panic(err)
	}

	czh, err := corpus.New("/app/out", "zh")
	if err != nil {
		panic(err)
	}

	ocrClient, err := ocr.New()
	if err != nil {
		panic(err)
	}

	jishoCache := map[string]*JishoProxyResponse{}
	gooCache := map[string]*GooProxyResponse{}
	ocrCache, err := persistedcache.New("/app/out/ocr_cache/")
	if err != nil {
		panic(err)
	}

	return &api{
		config:     cfg,
		jpCorpus:   cjp,
		zhCorpus:   czh,
		jisho:      jisho.New(),
		goo:        goo.New(),
		jishoCache: jishoCache,
		gooCache:   gooCache,
		ocr:        ocrClient,
		ocrCache:   ocrCache,
		cedict:     cedict.New(),
	}
}

func (api *api) Config() Config {
	return api.config
}

func (api *api) getCorpus(lang string) (corpus.Corpus, error) {
	switch lang {
	case "jp":
		return api.jpCorpus, nil
	case "zh":
		return api.zhCorpus, nil
	}

	return nil, fmt.Errorf("no corpus found for language %s", lang)
}

func (api *api) SearchCorpus(c echo.Context) error {
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

func (api *api) GetChapter(c echo.Context) error {
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

	if response, ok := api.gooCache[token]; ok {
		return c.JSON(http.StatusOK, response)
	}

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

	api.gooCache[token] = &response

	return c.JSON(http.StatusOK, response)
}

type GooProxyResponse struct {
	Word       string `json:"word"`
	Reading    string `json:"reading"`
	Definition string `json:"definition"`
}

func Hash(r io.Reader) (string, error) {
	hash := sha256.New()
	if _, err := io.Copy(hash, r); err != nil {
		return "", err
	}

	sum := hash.Sum(nil)

	return fmt.Sprintf("%x", sum), nil
}

func (api *api) OCR(c echo.Context) error {
	buf := &bytes.Buffer{}
	r := io.TeeReader(c.Request().Body, buf)

	sum, err := Hash(r)
	if err != nil {
		log.Println("could not process ocr request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	if response, ok := api.ocrCache.Get(sum); ok {
		return c.String(http.StatusOK, string(response))
	}

	res, err := api.ocr.Do(c.Request().Context(), buf)
	if err != nil {
		log.Println("could not process ocr request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	api.ocrCache.Put(sum, res)

	return c.String(http.StatusOK, string(res))
}

func (api *api) Cedict(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process cedict request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &CedictRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process cedict request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	res := map[string]*CedictResponse{}
	for _, token := range req.Words {
		if _, ok := res[token]; ok {
			continue
		}

		pinyin := api.cedict.HanziToPinyin(token)
		pinyinTones := cedict.PinyinTones(pinyin)
		meaning := api.cedict.GetByHanzi(token)

		res[token] = &CedictResponse{
			Source:      token,
			Pinyin:      pinyin,
			PinyinTones: pinyinTones,
		}

		if meaning != nil {
			res[token].HanziSimplified = meaning.Simplified
			res[token].HanziTraditional = meaning.Traditional
			res[token].Meanings = meaning.Meanings
		}
	}

	return c.JSON(http.StatusOK, res)
}

type CedictRequest struct {
	Words []string `json:"words"`
}

type CedictResponse struct {
	Source           string   `json:"source"`
	PinyinTones      string   `json:"pinyin_tones"`
	Pinyin           string   `json:"pinyin"`
	HanziSimplified  string   `json:"hanzi_simplified"`
	HanziTraditional string   `json:"hanzi_traditional"`
	Meanings         []string `json:"meanings"`
}
