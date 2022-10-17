package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"

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

	pages := getHTMLPages(book)

	page := strings.TrimPrefix(pages[0], "../")

	r, err := book.Open(page)
	if err != nil {
		panic(err)
	}

	data, err := ioutil.ReadAll(r)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(data))
}

func getHTMLPages(book *epub.Book) []string {
	points := book.Ncx.Points

	res := make([]string, len(points))
	for i, p := range points {
		res[i] = p.Content.Src
	}

	return res
}
