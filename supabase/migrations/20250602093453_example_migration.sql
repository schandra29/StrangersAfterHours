create table if not exists example_table (
  id uuid default gen_random_uuid() primary key,
  message text not null
);

insert into example_table (message) values ('Hello, world!');