# jp-mining-tools

Tools to help with Japanese sentence mining

## Syosetu scraper

```sh
go run cmd/scrape_syosetu/main.go --help
Usage of /var/folders/fw/0wq08yqd3fgd69t86wv72l040000gn/T/go-build4010932054/b001/exe/main:
  -end int
        the ending chapter (default 10)
  -series string
        the code of a series (default "n6316bn")
  -start int
        the starting chapter (default 1)
```

### Example

```sh
# Download the first 50 chapters of Mushoku Tensei
go run cmd/scrape_syosetu/main.go -series n9669bk -end 50
```

## Search for word in corpus

```sh
go run cmd/find_sentence/main.go -word これから
```
