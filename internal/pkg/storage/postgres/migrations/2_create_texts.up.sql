create table texts (
  id bigserial primary key,
  language_code varchar(3) not null,
  content text not null,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
