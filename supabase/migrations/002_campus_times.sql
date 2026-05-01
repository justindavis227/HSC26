create table if not exists campus_times (
  id serial primary key,
  campus_name text not null unique,
  location text not null default '',
  updated_at timestamptz default now()
);

alter table campus_times enable row level security;

create policy "Public can read campus_times"
  on campus_times for select using (true);

create policy "Authenticated can modify campus_times"
  on campus_times for all using (auth.role() = 'authenticated');

insert into campus_times (campus_name, location) values
  ('Blankenbaker',       'Wilkinson Hall'),
  ('Bullitt County',     'Willkie Auditorium'),
  ('Crestwood',          'Union Street Auditorium'),
  ('Elizabethtown',      'Eigenmann Base'),
  ('Indiana',            'Briscoe SAR'),
  ('La Grange',          'Fine Arts 015'),
  ('Prospect',           'Hodge 2975'),
  ('Shelby County',      'Hodge 1006'),
  ('Nelson County',      'Hodge 1055'),
  ('Southwest',          'Hodge 1059'),
  ('South Lou / Beechmont', 'Hodge 1000'),
  ('Franklin',           'Hodge 1050')
on conflict (campus_name) do nothing;
