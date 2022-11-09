FROM golang:1.19-alpine as build
WORKDIR /base
COPY . .
RUN go mod download
RUN GOOS=linux go install -v ./...

# # Create production container
FROM alpine:3.7
COPY --from=build /go/bin/* /
COPY --from=build /base/internal/pkg/storage/postgres/migrations /migrations/

# Run api_miner by default, can be one of the following: api_grammar, extract_epub, find_sentence, migrate, scrape_syosetu
ENTRYPOINT ["/api_miner"]
