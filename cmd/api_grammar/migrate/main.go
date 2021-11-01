package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/DavidHuie/gomigrate"
	"github.com/creasty/configo"

	_ "github.com/lib/pq"
)

type config struct {
	DatabaseURL string `envconfig:"database_url" valid:"required"`
}

func (c *config) AutoConfigure() error {
	return configo.Load(c, configo.Option{})
}

func main() {
	c := &config{}
	if err := c.AutoConfigure(); err != nil {
		panic(fmt.Sprintf("migration failed: %v\n", err))
	}

	db, err := sql.Open("postgres", c.DatabaseURL)
	if err != nil {
		panic(fmt.Sprintf("migration failed: %v\n", err))
	}

	migrator, _ := gomigrate.NewMigrator(db, gomigrate.Postgres{}, "./migrations")

	err = migrator.Migrate()
	if err != nil {
		log.Printf("error during migration: %v\n", err)
		log.Printf("migration failed, trying to roll back...\n")

		err = migrator.Rollback()
		if err != nil {
			log.Fatalf("migration is broken: %v\n", err)
		}
	}
}
