// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.16.0
// source: cards.sql

package postgres

import (
	"context"
	"encoding/json"
	"time"
)

const createPendingCard = `-- name: CreatePendingCard :one
insert into pending_cards (
  language_code,
  token,
  source_image,
  meta
) values (
  $1,
  $2,
  decode($3::text, 'base64'),
  $4
)
returning id
`

type CreatePendingCardParams struct {
	LanguageCode string
	Token        string
	SourceImage  string
	Meta         json.RawMessage
}

func (q *Queries) CreatePendingCard(ctx context.Context, arg CreatePendingCardParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, createPendingCard,
		arg.LanguageCode,
		arg.Token,
		arg.SourceImage,
		arg.Meta,
	)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const createText = `-- name: CreateText :one
insert into texts (
  language_code,
  content
) values (
  $1,
  $2
)
returning id
`

type CreateTextParams struct {
	LanguageCode string
	Content      string
}

func (q *Queries) CreateText(ctx context.Context, arg CreateTextParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, createText, arg.LanguageCode, arg.Content)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const getImageFromPendingCard = `-- name: GetImageFromPendingCard :one
select source_image
from pending_cards
where id = $1
`

func (q *Queries) GetImageFromPendingCard(ctx context.Context, id int64) ([]byte, error) {
	row := q.db.QueryRowContext(ctx, getImageFromPendingCard, id)
	var source_image []byte
	err := row.Scan(&source_image)
	return source_image, err
}

const getText = `-- name: GetText :one
select
  id,
  language_code,
  content,
  created_at,
  updated_at
from texts
where
  id = $1
`

func (q *Queries) GetText(ctx context.Context, id int64) (Text, error) {
	row := q.db.QueryRowContext(ctx, getText, id)
	var i Text
	err := row.Scan(
		&i.ID,
		&i.LanguageCode,
		&i.Content,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getTextsForLanguage = `-- name: GetTextsForLanguage :many
select
  id,
  language_code,
  created_at,
  updated_at
from texts
where
  language_code = $1
order by created_at asc
`

type GetTextsForLanguageRow struct {
	ID           int64
	LanguageCode string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (q *Queries) GetTextsForLanguage(ctx context.Context, languageCode string) ([]GetTextsForLanguageRow, error) {
	rows, err := q.db.QueryContext(ctx, getTextsForLanguage, languageCode)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetTextsForLanguageRow
	for rows.Next() {
		var i GetTextsForLanguageRow
		if err := rows.Scan(
			&i.ID,
			&i.LanguageCode,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listPendingCards = `-- name: ListPendingCards :many
select
  id,
  language_code,
  token,
  meta,
  created_at,
  updated_at
from pending_cards
where
  exported_at is null
  and language_code = $1
order by created_at asc
`

type ListPendingCardsRow struct {
	ID           int64
	LanguageCode string
	Token        string
	Meta         json.RawMessage
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (q *Queries) ListPendingCards(ctx context.Context, languageCode string) ([]ListPendingCardsRow, error) {
	rows, err := q.db.QueryContext(ctx, listPendingCards, languageCode)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ListPendingCardsRow
	for rows.Next() {
		var i ListPendingCardsRow
		if err := rows.Scan(
			&i.ID,
			&i.LanguageCode,
			&i.Token,
			&i.Meta,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const markCardAsExported = `-- name: MarkCardAsExported :exec
update pending_cards
set
  updated_at = now(),
  exported_at = now()
where id = $1
`

func (q *Queries) MarkCardAsExported(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, markCardAsExported, id)
	return err
}

const updateCard = `-- name: UpdateCard :exec
update pending_cards
set
  meta = $1,
  updated_at = now()
where id = $2
`

type UpdateCardParams struct {
	Meta json.RawMessage
	ID   int64
}

func (q *Queries) UpdateCard(ctx context.Context, arg UpdateCardParams) error {
	_, err := q.db.ExecContext(ctx, updateCard, arg.Meta, arg.ID)
	return err
}
