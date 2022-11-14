package controllers

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/antonve/language-learning-tools/internal/pkg/storage/postgres"
)

type TextsAPI interface {
	CreateText(c echo.Context) error
	ListTexts(c echo.Context) error
	GetText(c echo.Context) error
	UpdateReadingPosition(c echo.Context) error
}

type textsAPI struct {
	psql    *sql.DB
	queries *postgres.Queries
}

func NewTextsAPI(psql *sql.DB) TextsAPI {
	return &textsAPI{
		psql:    psql,
		queries: postgres.New(psql),
	}
}

func (api *textsAPI) ListTexts(c echo.Context) error {
	languageCode := c.QueryParam("language_code")
	if languageCode == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	rows, err := api.queries.GetTextsForLanguage(c.Request().Context(), languageCode)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	res := &ListTextsResponse{Texts: []Text{}}

	for _, row := range rows {
		res.Texts = append(res.Texts, Text{
			ID:           row.ID,
			LanguageCode: row.LanguageCode,
			Title:        row.Title,
		})
	}

	return c.JSON(http.StatusOK, res)
}

type Text struct {
	ID           int64  `json:"id"`
	LanguageCode string `json:"language_code"`
	Title        string `json:"title"`
	Content      string `json:"content,omitempty"`
	LastPosition int32  `json:"last_position,omitempty"`
}

type ListTextsResponse struct {
	Texts []Text `json:"texts"`
}

func (api *textsAPI) CreateText(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &CreateTextRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	if err := req.Validate(); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	id, err := api.queries.CreateText(c.Request().Context(), postgres.CreateTextParams{
		LanguageCode: req.LanguageCode,
		Title:        req.Title,
		Content:      req.Content,
	})
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, id)
}

type CreateTextRequest struct {
	LanguageCode string `json:"language_code"`
	Title        string `json:"title"`
	Content      string `json:"content"`
}

func (req *CreateTextRequest) Validate() error {
	if req.LanguageCode == "" {
		return errors.Errorf("language_code is required")
	}

	if req.Title == "" {
		return errors.Errorf("title is required")
	}

	if req.Content == "" {
		return errors.Errorf("content is required")
	}

	return nil
}

func (api *textsAPI) GetText(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	intID, err := strconv.Atoi(id)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	row, err := api.queries.GetText(c.Request().Context(), int64(intID))
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, Text{
		ID:           row.ID,
		LanguageCode: row.LanguageCode,
		Title:        row.Title,
		Content:      row.Content,
		LastPosition: row.LastPosition,
	})
}

type UpdateReadingPositionRequest struct {
	LastPosition int64 `json:"last_position"`
}

func (api *textsAPI) UpdateReadingPosition(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	intID, err := strconv.Atoi(id)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &UpdateReadingPositionRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	err = api.queries.UpdateReadingPositionOfText(c.Request().Context(), postgres.UpdateReadingPositionOfTextParams{
		ID:           int64(intID),
		LastPosition: int32(req.LastPosition),
	})
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusOK)
}
