-- name: FindMatchingTokens :many
select
  id,
  language_code,
  token,
  meta,
  notes,
  rating,
  created_at,
  updated_at
from word_tokens
where
  language_code = sqlc.arg('language_code')
  and token = any(sqlc.arg('tokens')::varchar(255))
order by created_at desc;