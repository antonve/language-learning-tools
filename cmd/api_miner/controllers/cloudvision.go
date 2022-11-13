package controllers

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/antonve/language-learning-tools/internal/pkg/ocr"
	"github.com/antonve/language-learning-tools/internal/pkg/persistedcache"
	"github.com/labstack/echo/v4"
)

type CloudVisionAPI interface {
	OCR(c echo.Context) error
}

type cloudVisionAPI struct {
	client ocr.Client
	cache  persistedcache.PersistedCache
}

func NewCloudVisionAPI(cache persistedcache.PersistedCache) CloudVisionAPI {
	client, err := ocr.New()
	if err != nil {
		panic(err)
	}

	return &cloudVisionAPI{
		cache:  cache,
		client: client,
	}
}

func (api *cloudVisionAPI) Hash(r io.Reader) (string, error) {
	hash := sha256.New()
	if _, err := io.Copy(hash, r); err != nil {
		return "", err
	}

	sum := hash.Sum(nil)

	return fmt.Sprintf("%x", sum), nil
}

func (api *cloudVisionAPI) OCR(c echo.Context) error {
	buf := &bytes.Buffer{}
	r := io.TeeReader(c.Request().Body, buf)

	sum, err := api.Hash(r)
	if err != nil {
		log.Println("could not process ocr request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	if response, ok := api.cache.Get(sum); ok {
		return c.String(http.StatusOK, string(response))
	}

	res, err := api.client.Do(c.Request().Context(), buf)
	if err != nil {
		log.Println("could not process ocr request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	api.cache.Put(sum, res)

	return c.String(http.StatusOK, string(res))
}
