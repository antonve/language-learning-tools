create table word_tokens (
  id uuid default gen_random_uuid() primary key,
  language_code varchar(10) not null,
  token varchar(255) not null,
  notes text,
  meta jsonb not null default '{}',
  -- Rating: 0 = new, 1 = just learned, 2 = comfortable, 3 = mature
  rating smallint default 0,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create index word_tokens_lang_token_idx on word_tokens (language_code, token);