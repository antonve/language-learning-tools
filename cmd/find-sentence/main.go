package main

import "flag"

func main() {
	var word string
	var path string

	flag.StringVar(&word, "word", "です", "the word to search for")
	flag.StringVar(&path, "path", "./out", "the path in which to look for files")

	flag.Parse()
}
