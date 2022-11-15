
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
