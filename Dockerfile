FROM golang:1.18

RUN mkdir /app
WORKDIR /app

# Copy over dependencies so we can cache go modules separately from the source code
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy over app code
COPY . .

# Install development tools
RUN make init

# Live reloading of our app
CMD ["air", "-c", ".air.toml"]
