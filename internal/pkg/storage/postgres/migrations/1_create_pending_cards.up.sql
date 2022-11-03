create table pending_cards (
  id bigserial primary key,
  language_code varchar(3) not null,
  token text not null,
  source_image bytea default NULL,
  meta jsonb not null default '{}',

  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  exported_at timestamp default NULL
);