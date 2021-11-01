CREATE EXTENSION pgcrypto;

create table problems (
  id uuid default gen_random_uuid() primary key,
  problem text not null,
  answers jsonb not null,
  correct_answer varchar(4) not null,
  source varchar(50) not null,
  source_id varchar(50) null
);
