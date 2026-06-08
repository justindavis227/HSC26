-- Pre Show video submission window settings (editable from the admin panel).
-- These keys live in camp_info (key/value). The app reads them with safe
-- in-code defaults (11:00–15:00, scheduled), so applying this migration is
-- optional — the admin "Save" upserts the same keys. Seeding here just makes
-- the defaults explicit in the database.
--
-- Keys:
--   video_open_time        "HH:MM" 24h, Eastern (camp time) — window opens
--   video_close_time       "HH:MM" 24h, Eastern (camp time) — window closes
--   video_submissions_mode 'scheduled' | 'open' | 'closed'
--     scheduled = follow the open/close window
--     open      = force open (accept submissions any time)
--     closed    = force closed (master off switch)

INSERT INTO public.camp_info (key, value)
VALUES
  ('video_open_time', '11:00'),
  ('video_close_time', '15:00'),
  ('video_submissions_mode', 'scheduled')
ON CONFLICT (key) DO NOTHING;
