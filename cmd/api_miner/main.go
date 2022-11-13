package main

import (
	"bytes"
	"crypto/sha256"
	"database/sql"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/jcramb/cedict"
	"github.com/kelseyhightower/envconfig"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"github.com/siongui/gojianfan"
	"github.com/yanyiwu/gojieba"

	"github.com/antonve/language-learning-tools/cmd/api_miner/controllers"
	"github.com/antonve/language-learning-tools/internal/pkg/corpus"
	"github.com/antonve/language-learning-tools/internal/pkg/ocr"
	"github.com/antonve/language-learning-tools/internal/pkg/persistedcache"
	"github.com/antonve/language-learning-tools/internal/pkg/storage/postgres"
	"github.com/antonve/language-learning-tools/internal/pkg/zdic"
)

func main() {
	api := NewAPI()

	e := echo.New()
	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("/:lang/corpus/:token", api.Corpus().Search)
	e.GET("/:lang/chapter/:series/:filename", api.Corpus().GetChapter)
	e.GET("/jp/jisho/:token", api.Japanese().JishoProxy)
	e.GET("/jp/goo/:token", api.Japanese().GooProxy)
	e.POST("/zh/cedict", api.Cedict)
	e.GET("/zh/zdic/:token", api.Zdic)
	e.POST("/ocr", api.OCR)
	e.POST("/zh/text-analyse", api.ChineseTextAnalyse)

	e.GET("/pending_cards", api.ListPendingCards)
	e.POST("/pending_cards", api.CreatePendingCard)
	e.PUT("/pending_cards/:id", api.UpdateCard)
	e.GET("/pending_cards/:id/image", api.CardImage)
	e.POST("/pending_cards/:id/mark", api.MarkCardAsExported)

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
	Corpus() controllers.CorpusAPI
	Japanese() controllers.JapaneseAPI

	OCR(c echo.Context) error
	Cedict(c echo.Context) error
	Zdic(c echo.Context) error
	ChineseTextAnalyse(e echo.Context) error

	ListPendingCards(c echo.Context) error
	CreatePendingCard(c echo.Context) error
	UpdateCard(c echo.Context) error
	CardImage(c echo.Context) error
	MarkCardAsExported(c echo.Context) error

	Config() Config
}

type api struct {
	config Config

	psql    *sql.DB
	queries *postgres.Queries

	corpus   controllers.CorpusAPI
	japanese controllers.JapaneseAPI

	ocr    ocr.Client
	cedict *cedict.Dict
	zdic   zdic.Zdic
	jieba  *gojieba.Jieba

	ocrCache persistedcache.PersistedCache
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

	ocrCache, err := persistedcache.New("/app/out/ocr_cache/")
	if err != nil {
		panic(err)
	}

	psql := initPostgres(cfg)

	return &api{
		config:   cfg,
		corpus:   controllers.NewCorpusAPI(cjp, czh),
		japanese: controllers.NewJapaneseAPI(),
		ocr:      ocrClient,
		ocrCache: ocrCache,
		cedict:   cedict.New(),
		zdic:     zdic.New(),
		psql:     psql,
		queries:  postgres.New(psql),
		jieba:    gojieba.NewJieba(),
	}
}

func initPostgres(config Config) *sql.DB {
	cfg := &config.Postgres
	conn := fmt.Sprintf(
		"host=%s user=%s dbname=%s password=%s sslmode=%s",
		cfg.Host,
		cfg.Username,
		cfg.Database,
		cfg.Password,
		cfg.SSLMode,
	)
	psql, err := sql.Open("pgx", conn)
	if err != nil {
		panic(fmt.Errorf("failed opening connection to postgres: %v", err))
	}

	return psql
}

func (api *api) Config() Config {
	return api.config
}

func (api *api) Corpus() controllers.CorpusAPI {
	return api.corpus
}

func (api *api) Japanese() controllers.JapaneseAPI {
	return api.japanese
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

		fmt.Println(token)

		defs := api.cedict.GetAllByHanzi(token)

		res[token] = &CedictResponse{
			Source:  token,
			Results: []CedictResultResponse{},
		}

		for _, d := range defs {
			res[token].Results = append(res[token].Results, CedictResultResponse{
				Pinyin:           d.Pinyin,
				PinyinTones:      cedict.PinyinTones(d.Pinyin),
				HanziSimplified:  d.Simplified,
				HanziTraditional: d.Traditional,
				Meanings:         d.Meanings,
			})
		}
	}

	return c.JSON(http.StatusOK, res)
}

type CedictRequest struct {
	Words []string `json:"words"`
}

type CedictResultResponse struct {
	PinyinTones      string   `json:"pinyin_tones"`
	Pinyin           string   `json:"pinyin"`
	HanziSimplified  string   `json:"hanzi_simplified"`
	HanziTraditional string   `json:"hanzi_traditional"`
	Meanings         []string `json:"meanings"`
}

type CedictResponse struct {
	Source  string                 `json:"source"`
	Results []CedictResultResponse `json:"results"`
}

func (api *api) Zdic(c echo.Context) error {
	token := c.Param("token")

	res, err := api.zdic.Search(token)
	if err != nil {
		fmt.Println(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	b := new(bytes.Buffer)
	enc := json.NewEncoder(b)
	enc.SetEscapeHTML(false)
	enc.Encode(&ZdicResponse{
		Source:     res.Word,
		Pinyin:     res.Pinyin,
		Zhuyin:     res.Zhuyin,
		AudioURL:   res.AudioURL,
		Definition: res.Definition,
	})

	return c.JSONBlob(http.StatusOK, b.Bytes())
}

type ZdicResponse struct {
	Source     string `json:"source"`
	Pinyin     string `json:"pinyin"`
	Zhuyin     string `json:"zhuyin"`
	AudioURL   string `json:"audio_url"`
	Definition string `json:"definition"`
}

type Card struct {
	ID           int64           `json:"id"`
	LanguageCode string          `json:"language_code"`
	Token        string          `json:"token"`
	SourceImage  string          `json:"source_image,omitempty"`
	Meta         json.RawMessage `json:"meta"`
}

type ListPendingCardsResponse struct {
	Cards []Card `json:"cards"`
}

func (api *api) ListPendingCards(c echo.Context) error {
	languageCode := c.QueryParam("language_code")
	if languageCode == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	rows, err := api.queries.ListPendingCards(c.Request().Context(), languageCode)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	res := &ListPendingCardsResponse{Cards: []Card{}}

	for _, row := range rows {
		res.Cards = append(res.Cards, Card{
			ID:           row.ID,
			LanguageCode: row.LanguageCode,
			Token:        row.Token,
			Meta:         row.Meta,
		})
	}

	return c.JSON(http.StatusOK, res)
}

type CreatePendingCardRequest struct {
	LanguageCode string          `json:"language_code"`
	Token        string          `json:"token"`
	SourceImage  string          `json:"source_image"`
	Meta         json.RawMessage `json:"meta"`
}

func (req *CreatePendingCardRequest) Validate() error {
	if req.LanguageCode == "" {
		return errors.Errorf("language_code is required")
	}

	if req.Token == "" {
		return errors.Errorf("token is required")
	}

	return nil
}

func (api *api) CreatePendingCard(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &CreatePendingCardRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	if err := req.Validate(); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	_, err = api.queries.CreatePendingCard(c.Request().Context(), postgres.CreatePendingCardParams{
		LanguageCode: req.LanguageCode,
		Token:        req.Token,
		SourceImage:  req.SourceImage,
		Meta:         req.Meta,
	})
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusCreated)
}

func (api *api) CardImage(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	intId, err := strconv.Atoi(id)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	img, err := api.queries.GetImageFromPendingCard(c.Request().Context(), int64(intId))
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	c.Response().Writer.Write(img)

	return c.NoContent(http.StatusOK)
}

type UpdateCardRequest struct {
	Meta json.RawMessage `json:"meta"`
}

func (api *api) UpdateCard(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &UpdateCardRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	id := c.Param("id")
	if id == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	intId, err := strconv.Atoi(id)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	if err := api.queries.UpdateCard(c.Request().Context(), postgres.UpdateCardParams{
		Meta: req.Meta,
		ID:   int64(intId),
	}); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return nil
}

func (api *api) MarkCardAsExported(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	intId, err := strconv.Atoi(id)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	if err := api.queries.MarkCardAsExported(c.Request().Context(), int64(intId)); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusCreated)
}

type ChineseTextAnalyseRequest struct {
	Text string `json:"text"`
}

type ChineseTextAnalyseLine struct {
	Simplified  string                    `json:"simplified"`
	Traditional string                    `json:"traditional"`
	Tokens      []ChineseTextAnalyseToken `json:"tokens"`
}

type ChineseTextAnalyseToken struct {
	Traditional string `json:"hanzi_traditional"`
	Simplified  string `json:"hanzi_simplified"`
	Start       int    `json:"start"`
	End         int    `json:"end"`
}

type ChineseTextAnalyseResponse struct {
	Lines []ChineseTextAnalyseLine `json:"lines"`
}

func (api *api) ChineseTextAnalyse(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &ChineseTextAnalyseRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	lines := strings.FieldsFunc(req.Text, func(c rune) bool {
		return c == '\n'
	})

	res := &ChineseTextAnalyseResponse{
		Lines: make([]ChineseTextAnalyseLine, len(lines)),
	}

	useHMM := true

	for i, line := range lines {
		simplified := gojianfan.T2S(line)
		words := api.jieba.Tokenize(simplified, gojieba.DefaultMode, useHMM)
		tokens := make([]ChineseTextAnalyseToken, len(words))

		for j, w := range words {
			tokens[j] = ChineseTextAnalyseToken{
				Traditional: line[w.Start:w.End],
				Simplified:  w.Str,
				Start:       w.Start,
				End:         w.End,
			}
		}

		res.Lines[i] = ChineseTextAnalyseLine{
			Simplified:  simplified,
			Traditional: line,
			Tokens:      tokens,
		}

	}
	return c.JSON(http.StatusOK, res)
}
