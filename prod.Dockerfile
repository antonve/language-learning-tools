FROM golang:1.19.0 AS builder

ENV CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /build

# Let's cache modules retrieval - those don't change so often
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy the code necessary to build the application
# You may want to change this to copy only what you actually need.
COPY . .

# Build the application
RUN go build ./cmd/api_miner

# Let's create a /dist folder containing just the files necessary for runtime.
# Later, it will be copied as the / (root) of the output image.
WORKDIR /dist
RUN cp /build/api_miner ./api_miner

# Optional: in case your application uses dynamic linking (often the case with CGO),
# this will collect dependent libraries so they're later copied to the final image
# NOTE: make sure you honor the license terms of the libraries you copy and distribute
RUN ldd api_miner | tr -s '[:blank:]' '\n' | grep '^/' | \
    xargs -I % sh -c 'mkdir -p $(dirname ./%); cp % ./%;'
RUN mkdir -p lib64 && cp /lib64/ld-linux-x86-64.so.2 lib64/

# Create the minimal runtime image
FROM scratch

COPY --chown=0:0 --from=builder /dist /
COPY --chown=0:0 --from=builder /go/pkg/mod/github.com/yanyiwu /go/pkg/mod/github.com/yanyiwu

# Set up the app to run as a non-root user
# User ID 65534 is usually user 'nobody'.
USER 65534

ENTRYPOINT ["/api_miner"]
