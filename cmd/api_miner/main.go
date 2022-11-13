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

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/kelseyhightower/envconfig"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"

	"github.com/antonve/language-learning-tools/cmd/api_miner/controllers"
	"github.com/antonve/language-learning-tools/internal/pkg/corpus"
	"github.com/antonve/language-learning-tools/internal/pkg/ocr"
	"github.com/antonve/language-learning-tools/internal/pkg/persistedcache"
	"github.com/antonve/language-learning-tools/internal/pkg/storage/postgres"
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
	e.POST("/zh/cedict", api.Chinese().Cedict)
	e.GET("/zh/zdic/:token", api.Chinese().Zdic)
	e.POST("/ocr", api.OCR)
	e.POST("/zh/text-analyse", api.Chinese().TextAnalyse)

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
	Chinese() controllers.ChineseAPI

	OCR(c echo.Context) error

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
	chinese  controllers.ChineseAPI

	ocr      ocr.Client
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
		chinese:  controllers.NewChineseAPI(),
		ocr:      ocrClient,
		ocrCache: ocrCache,
		psql:     psql,
		queries:  postgres.New(psql),
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

func (api *api) Chinese() controllers.ChineseAPI {
	return api.chinese
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
