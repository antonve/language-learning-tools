package main

import (
	"net/http"

	"github.com/creasty/configo"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Server interface {
	AutoConfigure() error

	Start()
}

func NewServer() Server {
	return &server{}
}

type server struct {
	Environment          string   `envconfig:"app_env" valid:"required" default:"development"`
	DatabaseURL          string   `envconfig:"database_url" valid:"required"`
	DatabaseMaxIdleConns int      `envconfig:"database_max_idle_conns" valid:"required"`
	DatabaseMaxOpenConns int      `envconfig:"database_max_open_conns" valid:"required"`
	CORSAllowedOrigins   []string `envconfig:"cors_allowed_origins" valid:"required"`
	Port                 string   `envconfig:"app_port" valid:"required"`

	e *echo.Echo
}

func (d *server) AutoConfigure() error {
	return configo.Load(d, configo.Option{})
}

func (d *server) Start() {
	e := echo.New()
	d.e = e

	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.Logger.Fatal(e.Start(":5555"))
}

func main() {
	server := NewServer()

	if err := server.AutoConfigure(); err != nil {
		panic("failed to configure server " + err.Error())
	}

	server.Start()
}
