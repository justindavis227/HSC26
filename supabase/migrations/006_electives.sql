create table if not exists electives (
  id serial primary key,
  day text not null,
  day_order int not null default 0,
  time_slot text not null,
  slot_order int not null default 0,
  theme text not null,
  theme_order int not null default 0,
  title text not null default '',
  speaker text not null default '',
  location text not null default '',
  updated_at timestamptz default now()
);
alter table electives enable row level security;
create policy "Public can read electives" on electives for select using (true);
create policy "Authenticated can modify electives" on electives for all using (auth.role() = 'authenticated');
insert into electives (day, day_order, time_slot, slot_order, theme, theme_order, title, speaker, location) values
  ('Tuesday June 30th',  1,'1:30-2:30',1,'Prayer',       2,'Prayer Equipping',                                                     'Carley Buckingham & Mike Vance',         'Alumni Hall'),
  ('Tuesday June 30th',  1,'1:30-2:30',1,'Serving',      4,'Unleash Your Career: More Than Just a Job',                           'Vennessa Womble',                        'Georgian Room'),
  ('Tuesday June 30th',  1,'1:30-2:30',1,'Miscellaneous',6,'The Journey of Foster Care and Adoption',                             'Vennessa Womble',                        'Georgian Room'),
  ('Tuesday June 30th',  1,'3:00-4:00',2,'Bible',        3,'How to Read Your Bible with Your Heart, Mind, and Soul',              'Dylan West',                             'Alumni Hall'),
  ('Tuesday June 30th',  1,'3:00-4:00',2,'Serving',      4,'Caring for Refugees: Compassion for the Marginalized',                'Morgan Kast & Matt McGuire',             'Whittenberger Auditorium'),
  ('Tuesday June 30th',  1,'3:00-4:00',2,'Miscellaneous',6,'Get Rich Quick Stewardship',                                          '',                                       'Georgian Room'),
  ('Wednesday July 1st', 2,'1:30-2:30',1,'Jesus',        1,'How to Follow Jesus After High School',                               'Caleb Hutchcraft (CAM)',                  'Georgian Room'),
  ('Wednesday July 1st', 2,'1:30-2:30',1,'Prayer',       2,'Prayer Equipping',                                                     'Carley Buckingham & Mike Vance',         'Alumni Hall'),
  ('Wednesday July 1st', 2,'1:30-2:30',1,'Miscellaneous',6,'Let''s Talk Mental Health: Open Q&A with Licensed Counselors',        'Care Ministry & Counselor Panel',        'Whittenberger Auditorium'),
  ('Wednesday July 1st', 2,'3:00-4:00',2,'Jesus',        1,'Lions-Living a Life of Boldness and Faith',                           'Matt Reagan',                            'Alumni Hall'),
  ('Wednesday July 1st', 2,'3:00-4:00',2,'Bible',        3,'The Structure, Story, and Study of Scripture',                        'Aubri Christensen',                      'Georgian Room'),
  ('Wednesday July 1st', 2,'3:00-4:00',2,'Miscellaneous',6,'Growing Up in a Porn Culture',                                        'Nick Buda BC-MHC & Lindsay Dugan RN',    'Whittenberger Auditorium'),
  ('Thursday July 2nd',  3,'1:30-2:30',1,'Jesus',        1,'Creation Waits',                                                       'Matt Reagan',                            'Alumni Hall'),
  ('Thursday July 2nd',  3,'1:30-2:30',1,'Bible',        3,'Dopamine and Discipleship: Who''s Training Your Brain?',              'Aubri Christensen',                      'Georgian Room'),
  ('Thursday July 2nd',  3,'1:30-2:30',1,'Evangelism',   5,'I''m Interested in Baptism',                                          'Logan Robert',                           'Whittenberger Auditorium'),
  ('Thursday July 2nd',  3,'3:00-4:00',2,'Jesus',        1,'God in Time and Flesh',                                               'Mike Wallace',                           'Georgian Room'),
  ('Thursday July 2nd',  3,'3:00-4:00',2,'Serving',      4,'I Think I''m Called to Ministry',                                     'Send Ministry',                          'Alumni Hall'),
  ('Thursday July 2nd',  3,'3:00-4:00',2,'Evangelism',   5,'I''m Interested in Baptism',                                          'Logan Robert',                           'Whittenberger Auditorium'),
  ('Friday July 3rd',    4,'1:30-2:30',1,'Jesus',        1,'Jesus Magic?',                                                         'Mike Wallace',                           'Georgian Room'),
  ('Friday July 3rd',    4,'1:30-2:30',1,'Serving',      4,'I Think I''m Called to Ministry',                                     'Send Ministry',                          'Alumni Hall'),
  ('Friday July 3rd',    4,'1:30-2:30',1,'Evangelism',   5,'I''m Interested in Baptism',                                          'Logan Robert',                           'Whittenberger Auditorium'),
  ('Friday July 3rd',    4,'3:00-4:00',2,'Evangelism',   5,'Dating',                                                               'Lucas & Teeya DeVries & Panel',          'Alumni Hall'),
  ('Friday July 3rd',    4,'3:00-4:00',2,'Miscellaneous',6,'Light Up the Darkness: Help for Depression, Self-Harm & Suicide Ideation','Brent Colwick LPCC',                'Whittenberger Auditorium');
