package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/antonve/language-learning-tools/internal/pkg/goo"
	"github.com/antonve/language-learning-tools/internal/pkg/jisho"
)

type JapaneseAPI interface {
	JishoProxy(c echo.Context) error
	GooProxy(c echo.Context) error
}

type japaneseAPI struct {
	jisho jisho.Jisho
	goo   goo.Goo

	jishoCache map[string]*JishoProxyResponse
	gooCache   map[string]*GooProxyResponse
}

func NewJapaneseAPI() JapaneseAPI {
	jishoCache := map[string]*JishoProxyResponse{}
	gooCache := map[string]*GooProxyResponse{}

	return &japaneseAPI{
		jisho:      jisho.New(),
		goo:        goo.New(),
		jishoCache: jishoCache,
		gooCache:   gooCache,
	}
}

func (api *japaneseAPI) JishoProxy(c echo.Context) error {
	token := c.Param("token")
	c.Echo().Logger.Infof("jisho for %s", token)

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

func (api *japaneseAPI) GooProxy(c echo.Context) error {
	token := c.Param("token")

	c.Echo().Logger.Infof("goo for %s", token)
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
