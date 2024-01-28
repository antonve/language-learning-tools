package controllers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/antonve/language-learning-tools/internal/pkg/gtranslate"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
)

type TranslateAPI interface {
	Translate(e echo.Context) error
}

type translateAPI struct {
	gtranslate *gtranslate.GTranslate
}

func NewTranslateAPI(gtranslate *gtranslate.GTranslate) TranslateAPI {
	return &translateAPI{gtranslate: gtranslate}
}

func (api *translateAPI) Translate(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &TranslateRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	if err := req.Validate(); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	translation, err := api.gtranslate.Translate(c.Request().Context(), req.Input, req.SourceLanguageCode, req.TargetLanguageCode)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, TranslateResponse{
		Translation: translation,
	})
}

type TranslateRequest struct {
	SourceLanguageCode string `json:"source_language_code"`
	TargetLanguageCode string `json:"target_language_code"`
	Input              string `json:"input"`
}

func (req *TranslateRequest) Validate() error {
	if req.SourceLanguageCode == "" {
		return errors.Errorf("source_language_code is required")
	}

	if req.TargetLanguageCode == "" {
		return errors.Errorf("target_language_code is required")
	}

	if req.Input == "" {
		return errors.Errorf("input is required")
	}

	return nil
}

type TranslateResponse struct {
	Translation string `json:"translation"`
}
