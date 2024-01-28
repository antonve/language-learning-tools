package controllers

import (
	"net/http"

	"github.com/antonve/language-learning-tools/internal/pkg/german/lemmatizer"
	"github.com/labstack/echo/v4"
)

type GermanAPI interface {
	Lemma(e echo.Context) error
}

type germanAPI struct {
	lemmatizer *lemmatizer.GermanLemmatizer
}

func NewGermanAPI() GermanAPI {
	return &germanAPI{lemmatizer: lemmatizer.NewGermanLemmatizer()}
}

func (api *germanAPI) Lemma(c echo.Context) error {
	token := c.Param("token")
	lemmas := api.lemmatizer.Lemmas(token)

	return c.JSON(http.StatusOK, GermanLemmaResponse{Lemmas: lemmas})
}

type GermanLemmaResponse struct {
	Lemmas []string `json:"lemmas"`
}
