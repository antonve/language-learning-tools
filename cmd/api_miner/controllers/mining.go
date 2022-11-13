package controllers

import (
	"database/sql"
	_ "embed"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/antonve/language-learning-tools/internal/pkg/storage/postgres"
)

type MiningAPI interface {
	ListPendingCards(c echo.Context) error
	CreatePendingCard(c echo.Context) error
	UpdateCard(c echo.Context) error
	CardImage(c echo.Context) error
	MarkCardAsExported(c echo.Context) error
}

type miningAPI struct {
	psql    *sql.DB
	queries *postgres.Queries
}

func NewMiningAPI(psql *sql.DB) MiningAPI {
	return &miningAPI{
		psql:    psql,
		queries: postgres.New(psql),
	}
}

func (api *miningAPI) ListPendingCards(c echo.Context) error {
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

func (api *miningAPI) CreatePendingCard(c echo.Context) error {
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

func (api *miningAPI) CardImage(c echo.Context) error {
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

func (api *miningAPI) UpdateCard(c echo.Context) error {
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

type UpdateCardRequest struct {
	Meta json.RawMessage `json:"meta"`
}

func (api *miningAPI) MarkCardAsExported(c echo.Context) error {
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
