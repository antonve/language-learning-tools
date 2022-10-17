package main

import (
	"archive/zip"
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

	pageURLs := getPageList(book)
	pageReaders := getReaders(book, pageURLs)

	imageURLs := getImages(book, pageReaders)
	imageReaders := getReaders(book, imageURLs)

	filename := fmt.Sprintf("%s.zip", book.Opf.Metadata.Title)
	createArchive(filename, imageReaders)

	fmt.Println("Converted: ", filename)
}

func createArchive(filename string, readers []io.Reader) {
	archive, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	defer archive.Close()
	zipWriter := zip.NewWriter(archive)

	for i, r := range readers {
		w, err := zipWriter.Create(fmt.Sprintf("%05d.jpg", i))
		if err != nil {
			panic(err)
		}

		if _, err := io.Copy(w, r); err != nil {
			panic(err)
		}
	}

	zipWriter.Close()
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

func getReaders(book *epub.Book, files []string) []io.Reader {
	res := []io.Reader{}

	for _, file := range files {
		f := trimURL(file)

		r, err := book.Open(f)
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
