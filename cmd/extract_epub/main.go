package main

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/antchfx/htmlquery"
	"github.com/kapmahc/epub"
)

func main() {
	if len(os.Args) <= 1 {
		fmt.Println("missing epub file as argument")
		os.Exit(1)
	}

	path := os.Args[1]

	book, err := epub.Open(path)
	if err != nil {
		panic(err)
	}

	// for _, f := range book.Files() {
	//   fmt.Println(f)
	// }

	pageURLs := getPageList(book)
	// fmt.Println(pageURLs)
	pageReaders := getPageReaders(book, pageURLs)
	// fmt.Println(pageReaders)

	images := getImages(book, pageReaders)

	fmt.Println(len(images))

	for _, image := range images {
		fmt.Println(image)
	}
}

func getImages(book *epub.Book, readers []io.Reader) []string {
	res := []string{}

	for _, r := range readers {
		for _, url := range getImageURLs(r) {
			res = append(res, url)
		}
	}

	return res
}

func getImageURLs(page io.Reader) []string {
	urls := []string{}

	doc, err := htmlquery.Parse(page)
	if err != nil {
		panic(err)
	}

	for _, img := range htmlquery.Find(doc, "//img") {
		url := trimURL(htmlquery.SelectAttr(img, "src"))
		urls = append(urls, url)
	}

	return urls
}

func trimURL(url string) string {
	return strings.TrimPrefix(url, "../")
}

func getPageReaders(book *epub.Book, pages []string) []io.Reader {
	res := []io.Reader{}

	for _, page := range pages {
		p := trimURL(page)

		r, err := book.Open(p)
		if err != nil {
			panic(err)
		}

		res = append(res, r)
	}

	return res
}

func getPageList(book *epub.Book) []string {
	points := book.Ncx.Points

	res := make([]string, len(points))
	for i, p := range points {
		res[i] = p.Content.Src
	}

	return res
}
