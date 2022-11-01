package zdic

import (
	"fmt"
	"net/url"

	"github.com/antchfx/htmlquery"
	"github.com/pkg/errors"
	"golang.org/x/net/html"
)

type Zdic interface {
	Search(word string) (*Result, error)
}

type zdic struct {
}

func New() Zdic {
	return &zdic{}
}

func (z *zdic) Search(word string) (*Result, error) {
	doc, err := htmlquery.LoadURL("https://www.zdic.net/hans/" + url.QueryEscape(word))
	if err != nil {
		return nil, errors.Wrap(err, "failed to load")
	}

	res := &Result{
		Word:       word,
		Definition: z.getDefinition(doc),
	}

	readings := z.getReadings(doc)
	res.Pinyin = readings.Pinyin
	res.Zhuyin = readings.Zhuyin
	res.AudioURL = readings.Audio

	if res.AudioURL == "" {
		res.AudioURL = fmt.Sprintf("https://tts.baidu.com/text2audio?tex=%s&cuid=dict&lan=ZH&ctp=5&pdt=20&vol=9", word)
	}

	return res, nil
}

func (z *zdic) getDefinition(doc *html.Node) string {
	def := htmlquery.FindOne(doc, "//*[@class=\"nr-box nr-box-shiyi jbjs\"][1]//*[contains(@class, \"jnr\")][1]")
	return htmlquery.InnerText(def)
}

func (z *zdic) getReadings(doc *html.Node) *Readings {
	res := &Readings{
		Pinyin: "",
		Zhuyin: "",
	}

	// Pattern 1: single characters
	pinyin := htmlquery.FindOne(doc, "//*[contains(@class, \"z_py\")][1]//*[contains(@class, \"z_d\")][1]")
	if pinyin != nil {
		res.Pinyin = htmlquery.InnerText(pinyin)
	}

	zhuyin := htmlquery.FindOne(doc, "//*[contains(@class, \"z_zy\")][1]//*[contains(@class, \"z_d\")][1]")
	if zhuyin != nil {
		res.Zhuyin = htmlquery.InnerText(zhuyin)
	}

	audio := htmlquery.FindOne(doc, "//*[@class=\"z_py\"]//*[contains(@class, \"audio_play_button\")][1]")
	if audio != nil {
		res.Audio = htmlquery.SelectAttr(audio, "data-src-mp3")
	}

	// Pattern 2: Compound words
	nodes := htmlquery.Find(doc, "//*[contains(@class, \"entry_title\")][1]//*[contains(@class, \"dicpy\")]")

	if len(nodes) >= 2 && res.Pinyin == "" {
		res.Pinyin = htmlquery.InnerText(nodes[0])
	}

	if len(nodes) >= 2 && res.Zhuyin == "" {
		res.Zhuyin = htmlquery.InnerText(nodes[1])
	}

	return res
}

type Readings struct {
	Pinyin string
	Zhuyin string
	Audio  string
}

type Result struct {
	Word             string
	Pinyin           string
	Zhuyin           string
	AudioURL         string
	HanziSimplified  string
	HanziTraditional string
	Definition       string
}
