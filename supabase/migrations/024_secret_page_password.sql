-- Secret page unlock code, editable from the admin panel
-- (Sessions → Secret Page).
--
-- The code lives in camp_info (key/value). password-modal.tsx reads this
-- key at runtime and falls back to an in-code default if the fetch fails,
-- so applying this migration is optional — the admin "Save" upserts the
-- same key. Seeding here just makes the current value explicit in the DB.
--
-- Key:
--   secret_page_password   plaintext unlock code for /secret-page
--
-- NOTE: camp_info has public-read RLS, so this value is technically
-- fetchable via the public API. That matches the prior behavior (the code
-- was hardcoded in the client bundle). This is a low-stakes scavenger-hunt
-- code, not a security boundary.

INSERT INTO public.camp_info (key, value)
VALUES ('secret_page_password', 'JeFFerSON')
ON CONFLICT (key) DO NOTHING;
