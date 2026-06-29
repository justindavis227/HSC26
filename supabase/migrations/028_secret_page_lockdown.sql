-- Secret Page security lockdown.
--
-- Problem: camp_info had a blanket public-read policy (`USING (true)`), so the
-- anon API key (shipped in the browser bundle) could read EVERY key/value,
-- including `secret_page_password` and `secret_page_password_2`. The first
-- modal also compared the code in the browser, so the code had to be sent to
-- the device to be checked. Together these let anyone read the unlock codes
-- straight from the public REST API (e.g. /rest/v1/camp_info). Supabase's
-- linter ignores public SELECT policies by design, so it never flagged this.
--
-- Fix:
--   1. Restrict the public read policy so anon can read every key EXCEPT the
--      `secret_page_password%` keys. Admins (authenticated) still read all rows
--      via the existing "Admin write camp_info" FOR ALL policy, so the admin
--      panel and the claim_secret_ticket RPC (SECURITY DEFINER) are unaffected.
--   2. Add verify_secret_page_code() so the first gate is checked server-side
--      and the code is never sent to the browser. Case-SENSITIVE match (the
--      first code is intentionally mixed-case and tied to in-person clues).
--
-- Codes are NOT changed here — they must stay byte-for-byte identical because
-- they are connected to in-person game clues.

-- 1. Hide the secret codes from anonymous reads.
DROP POLICY IF EXISTS "Public read camp_info" ON public.camp_info;
CREATE POLICY "Public read camp_info" ON public.camp_info
  FOR SELECT
  USING (key NOT LIKE 'secret_page_password%');

-- 2. Server-side verification of the first (modal) code. Case-sensitive;
--    trims surrounding whitespace on both sides. Returns only true/false.
CREATE OR REPLACE FUNCTION public.verify_secret_page_code(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct text;
BEGIN
  SELECT value INTO v_correct FROM public.camp_info WHERE key = 'secret_page_password';
  RETURN v_correct IS NOT NULL
     AND length(btrim(v_correct)) > 0
     AND btrim(p_code) = btrim(v_correct);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_secret_page_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_secret_page_code(text) TO anon, authenticated;
