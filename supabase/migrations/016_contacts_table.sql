create table if not exists contacts (
  id          serial primary key,
  sort_order  integer not null default 0,
  name        text    not null default '',
  role        text    not null default '',
  email       text    not null default '',
  phone       text    not null default '',
  available   text    not null default '',
  created_at  timestamptz default now()
);

alter table contacts enable row level security;

create policy "Public read contacts"
  on contacts for select using (true);

create policy "Auth all contacts"
  on contacts for all using (auth.role() = 'authenticated');

-- Seed from static camp-data
insert into contacts (sort_order, name, role, email, phone, available) values
  (1, 'Sarah Johnson',       'Camp Director',           'sarah.johnson@summercamp.org',     '(555) 123-4567', 'Mon-Fri, 8:00 AM - 5:00 PM'),
  (2, 'Mike Chen',           'Program Coordinator',     'mike.chen@summercamp.org',          '(555) 123-4568', 'Mon-Fri, 8:00 AM - 5:00 PM'),
  (3, 'Dr. Emily Rodriguez', 'Health & Safety Officer', 'emily.rodriguez@summercamp.org',   '(555) 123-4569', '24/7 Emergency Line'),
  (4, 'James Wilson',        'Activities Director',     'james.wilson@summercamp.org',       '(555) 123-4570', 'Mon-Fri, 9:00 AM - 4:00 PM');
