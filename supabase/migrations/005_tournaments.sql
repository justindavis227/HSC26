create table if not exists tournaments (
  id serial primary key,
  day text not null,
  day_order int not null default 0,
  activity text not null,
  sort_order int not null default 0,
  updated_at timestamptz default now()
);
alter table tournaments enable row level security;
create policy "Public can read tournaments" on tournaments for select using (true);
create policy "Authenticated can modify tournaments" on tournaments for all using (auth.role() = 'authenticated');
insert into tournaments (day, day_order, activity, sort_order) values
  ('Tuesday',   1, 'Volleyball',                                             1),
  ('Tuesday',   1, 'Super Smash Bros.',                                      2),
  ('Tuesday',   1, 'Uno',                                                    3),
  ('Wednesday', 2, 'Soccer',                                                 1),
  ('Wednesday', 2, 'Dodgeball',                                              2),
  ('Wednesday', 2, 'Rocket League',                                          3),
  ('Wednesday', 2, 'Bingo',                                                  4),
  ('Thursday',  3, '3v3 Basketball',                                         1),
  ('Thursday',  3, 'Mario Kart',                                             2),
  ('Thursday',  3, 'Nertz',                                                  3),
  ('Friday',    4, 'Championships for Basketball, Dodgeball, and Volleyball', 1),
  ('Friday',    4, 'Chess',                                                  2);
