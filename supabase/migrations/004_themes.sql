create table if not exists themes (
  id serial primary key,
  day text not null unique,
  theme_name text not null default '',
  sort_order int not null default 0,
  updated_at timestamptz default now()
);

alter table themes enable row level security;

create policy "Public can read themes" on themes for select using (true);
create policy "Authenticated can modify themes" on themes for all using (auth.role() = 'authenticated');

insert into themes (day, theme_name, sort_order) values
  ('Monday',    'Neon',               1),
  ('Tuesday',   'Western',            2),
  ('Wednesday', 'Campus Colors',      3),
  ('Thursday',  'Christmas in July',  4),
  ('Friday',    '4th of July',        5)
on conflict (day) do nothing;
