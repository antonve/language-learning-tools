-- name: ListPendingCards :many
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
  and language_code = sqlc.arg('language_code')
order by created_at asc;

-- name: GetImageFromPendingCard :one
select source_image
from pending_cards
where id = sqlc.arg('id');

-- name: CreatePendingCard :one
insert into pending_cards (
  language_code,
  token,
  source_image,
  meta
) values (
  sqlc.arg('language_code'),
  sqlc.arg('token'),
  decode(sqlc.arg('source_image')::text, 'base64'),
  sqlc.arg('meta')
)
returning id;

-- name: UpdateCard :exec
update pending_cards
set
  meta = sqlc.arg('meta'),
  updated_at = now()
where id = sqlc.arg('id');

-- name: MarkCardAsExported :exec
update pending_cards
set
  updated_at = now(),
  exported_at = now()
where id = sqlc.arg('id');

-- name: GetTextsForLanguage :many
select
  id,
  language_code,
  title,
  created_at,
  updated_at
from texts
where
  language_code = sqlc.arg('language_code')
order by created_at desc;

-- name: CreateText :one
insert into texts (
  language_code,
  title,
  content
) values (
  sqlc.arg('language_code'),
  sqlc.arg('title'),
  sqlc.arg('content')
)
returning id;

-- name: GetText :one
select
  id,
  language_code,
  title,
  content,
  last_position,
  created_at,
  updated_at
from texts
where
  id = sqlc.arg('id');

-- name: UpdateReadingPositionOfText :exec
update texts
set last_position = sqlc.arg('last_position')
where
  id = sqlc.arg('id')
  and last_position < sqlc.arg('last_position');
