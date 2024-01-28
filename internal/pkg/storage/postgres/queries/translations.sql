-- name: GetTranslation :many
select
  id,
  translation
from translations
where
  source_language_code = sqlc.arg('source_language_code')
  and target_language_code = sqlc.arg('target_language_code')
  and input = sqlc.arg('input')
limit 1;

-- name: StoreTranslation :one
insert into translations (
  source_language_code,
  target_language_code,
  input,
  translation
) values (
  sqlc.arg('source_language_code'),
  sqlc.arg('target_language_code'),
  sqlc.arg('input'),
  sqlc.arg('translation')
)
returning id;