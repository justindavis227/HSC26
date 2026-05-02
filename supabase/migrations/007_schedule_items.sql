create table if not exists schedule_items (
  id         serial primary key,
  campus     text        not null,
  day        text        not null,
  day_order  int         not null default 0,
  time       text        not null default '',
  activity   text        not null,
  location   text        not null default '',
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

alter table schedule_items enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'schedule_items' and policyname = 'Public can read schedule_items'
  ) then
    execute 'create policy "Public can read schedule_items" on schedule_items for select using (true)';
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'schedule_items' and policyname = 'Authenticated can modify schedule_items'
  ) then
    execute 'create policy "Authenticated can modify schedule_items" on schedule_items for all using (auth.role() = ''authenticated'')';
  end if;
end $$;
