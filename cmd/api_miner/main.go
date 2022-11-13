package main

import (
	"bytes"
	"crypto/sha256"
	"database/sql"
	_ "embed"
	"fmt"
	"io"
	"log"
	"net/http"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/kelseyhightower/envconfig"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/antonve/language-learning-tools/cmd/api_miner/controllers"
	"github.com/antonve/language-learning-tools/internal/pkg/corpus"
	"github.com/antonve/language-learning-tools/internal/pkg/ocr"
	"github.com/antonve/language-learning-tools/internal/pkg/persistedcache"
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

	e.GET("/pending_cards", api.Mining().ListPendingCards)
	e.POST("/pending_cards", api.Mining().CreatePendingCard)
	e.PUT("/pending_cards/:id", api.Mining().UpdateCard)
	e.GET("/pending_cards/:id/image", api.Mining().CardImage)
	e.POST("/pending_cards/:id/mark", api.Mining().MarkCardAsExported)

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
	Mining() controllers.MiningAPI

	OCR(c echo.Context) error

	Config() Config
}

type api struct {
	config Config

	corpus   controllers.CorpusAPI
	japanese controllers.JapaneseAPI
	chinese  controllers.ChineseAPI
	mining   controllers.MiningAPI

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
		mining:   controllers.NewMiningAPI(psql),
		ocr:      ocrClient,
		ocrCache: ocrCache,
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

func (api *api) Mining() controllers.MiningAPI {
	return api.mining
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
