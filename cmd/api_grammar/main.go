package main

import (
	"net/http"

	"github.com/creasty/configo"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type ServerDependencies interface {
	AutoConfigure() error

	Init()
}

func NewServerDependencies() ServerDependencies {
	return &serverDependencies{}
}

type serverDependencies struct {
	Environment          string   `envconfig:"app_env" valid:"required" default:"development"`
	DatabaseURL          string   `envconfig:"database_url" valid:"required"`
	DatabaseMaxIdleConns int      `envconfig:"database_max_idle_conns" valid:"required"`
	DatabaseMaxOpenConns int      `envconfig:"database_max_open_conns" valid:"required"`
	CORSAllowedOrigins   []string `envconfig:"cors_allowed_origins" valid:"required"`
	Port                 string   `envconfig:"app_port" valid:"required"`
}

func (d *serverDependencies) AutoConfigure() error {
	return configo.Load(d, configo.Option{})
}

func (d *serverDependencies) Init() {
}

func main() {
	e := echo.New()
	e.Use(middleware.CORS())

	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.Logger.Fatal(e.Start(":5555"))
}
