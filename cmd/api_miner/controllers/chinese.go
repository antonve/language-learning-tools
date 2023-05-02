package controllers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/jcramb/cedict"
	"github.com/labstack/echo/v4"
	"github.com/siongui/gojianfan"
	"github.com/yanyiwu/gojieba"

	"github.com/antonve/language-learning-tools/internal/pkg/zdic"
)

type ChineseAPI interface {
	Cedict(c echo.Context) error
	Zdic(c echo.Context) error
	TextAnalyse(e echo.Context) error
}

type chineseAPI struct {
	cedict *cedict.Dict
	zdic   zdic.Zdic
	jieba  *gojieba.Jieba
}

func NewChineseAPI() ChineseAPI {
	return &chineseAPI{
		cedict: cedict.New(),
		zdic:   zdic.New(),
		jieba:  gojieba.NewJieba(),
	}
}

func (api *chineseAPI) Cedict(c echo.Context) error {
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

		c.Echo().Logger.Infof("cedict: %w", token)

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

func (api *chineseAPI) Zdic(c echo.Context) error {
	token := c.Param("token")

	c.Echo().Logger.Infof("zdic: %w", token)

	res, err := api.zdic.Search(token)
	if err != nil {
		c.Echo().Logger.Error(err)
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

func (api *chineseAPI) TextAnalyse(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	req := &TextAnalyseRequest{}
	if err := json.Unmarshal(body, req); err != nil {
		log.Println("could not process request:", err)
		return c.NoContent(http.StatusBadRequest)
	}

	lines := strings.FieldsFunc(req.Text, func(c rune) bool {
		return c == '\n'
	})

	res := &ChineseTextAnalyseResponse{
		Lines: make([]TextAnalyseLine, len(lines)),
	}

	useHMM := true

	for i, line := range lines {
		simplified := gojianfan.T2S(line)
		words := api.jieba.Tokenize(simplified, gojieba.DefaultMode, useHMM)
		tokens := make([]TextAnalyseToken, len(words))

		for j, w := range words {
			tokens[j] = TextAnalyseToken{
				Traditional: line[w.Start:w.End],
				Simplified:  w.Str,
				Start:       w.Start,
				End:         w.End,
			}
		}

		res.Lines[i] = TextAnalyseLine{
			Simplified:  simplified,
			Traditional: line,
			Tokens:      tokens,
		}

	}
	return c.JSON(http.StatusOK, res)
}

type TextAnalyseRequest struct {
	Text string `json:"text"`
}

type TextAnalyseLine struct {
	Simplified  string             `json:"simplified"`
	Traditional string             `json:"traditional"`
	Tokens      []TextAnalyseToken `json:"tokens"`
}

type TextAnalyseToken struct {
	Traditional string `json:"hanzi_traditional"`
	Simplified  string `json:"hanzi_simplified"`
	Start       int    `json:"start"`
	End         int    `json:"end"`
}

type ChineseTextAnalyseResponse struct {
	Lines []TextAnalyseLine `json:"lines"`
}
