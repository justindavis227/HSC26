-- High School Camp 2026 — initial schema
-- Run in Supabase SQL editor or via supabase db push

-- Announcements table (mirrors campData.announcements)
create table if not exists announcements (
  id         serial primary key,
  date       date        not null,
  title      text        not null,
  content    text        not null,
  priority   text        not null default 'normal' check (priority in ('high', 'normal')),
  created_at timestamptz not null default now()
);

-- Generic camp info key-value store (for admin updates)
create table if not exists camp_info (
  id         serial primary key,
  key        text        not null unique,
  value      text        not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: allow public reads
alter table announcements enable row level security;
create policy "Public read announcements"
  on announcements for select using (true);

alter table camp_info enable row level security;
create policy "Public read camp_info"
  on camp_info for select using (true);

-- Admin writes require auth (service role key or authenticated user with admin role)
create policy "Admin insert announcements"
  on announcements for insert
  with check (auth.role() = 'authenticated');

create policy "Admin update announcements"
  on announcements for update
  using (auth.role() = 'authenticated');

create policy "Admin delete announcements"
  on announcements for delete
  using (auth.role() = 'authenticated');

create policy "Admin write camp_info"
  on camp_info for all
  using (auth.role() = 'authenticated');
