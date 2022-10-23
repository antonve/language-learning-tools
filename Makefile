init:
	go install github.com/cosmtrek/air@v1.29.0
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.15.2

generate: generate_sql

generate_sql:
	cd internal/pkg/storage/postgres; go generate

migrate:
	MIGRATION_ARGS="up" make migrate_docker

migrate_docker:
	docker compose exec api bash -c "go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.15.2"
	docker compose exec api bash -c "migrate -source file://internal/pkg/storage/postgres/migrations -database postgres://root:hunter2@postgis:5432/mining_tools?sslmode=disable $(MIGRATION_ARGS)"

run:
	docker compose up