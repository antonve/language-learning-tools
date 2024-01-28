create table translations (
  id uuid default gen_random_uuid() primary key,
  source_language_code varchar(10) not null,
  target_language_code varchar(10) not null,
  input varchar(255) not null,
  translation text not null,

  translated_at timestamp not null default now()
);

create index all_translations_idx on translations (source_language_code, input);
create index translations_idx on translations (source_language_code, target_language_code, input);