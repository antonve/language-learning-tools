package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) <= 1 {
		fmt.Println("missing epub file as argument")
		os.Exit(1)
	}
	path := os.Args[1]

	fmt.Println(path)
}
