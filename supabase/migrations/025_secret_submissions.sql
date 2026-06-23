-- Secret Page Phase 2: challenge submissions + winner certificate
--
-- After unlocking the secret page (first password), users submit their info
-- plus a SECOND secret code (discovered at camp). The first person to enter
-- the correct code wins; later correct entries are runners-up; wrong entries
-- are denied but still logged.
--
-- The correct second code lives in camp_info under `secret_page_password_2`
-- (admin-editable, Sessions -> Secret Page). It is ONLY read inside the
-- SECURITY DEFINER RPC below, so it is never exposed to the browser. Until a
-- non-empty code is set, every submission is denied.

CREATE TABLE IF NOT EXISTS public.secret_submissions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  campus       text NOT NULL,
  code_attempt text NOT NULL,
  is_correct   boolean NOT NULL,
  is_winner    boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.secret_submissions ENABLE ROW LEVEL SECURITY;

-- No public INSERT policy: rows are written only through the SECURITY DEFINER
-- RPC (which bypasses RLS), keeping the correct code server-side and the
-- winner decision atomic.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='secret_submissions' AND policyname='Authenticated can select secret submissions') THEN
    EXECUTE 'CREATE POLICY "Authenticated can select secret submissions" ON public.secret_submissions FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='secret_submissions' AND policyname='Authenticated can delete secret submissions') THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete secret submissions" ON public.secret_submissions FOR DELETE USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Submit + evaluate. Returns 'winner' | 'runner_up' | 'denied'.
CREATE OR REPLACE FUNCTION public.submit_secret_response(
  p_first_name text,
  p_last_name  text,
  p_campus     text,
  p_code       text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_code   text;
  v_is_correct     boolean;
  v_is_winner      boolean := false;
  v_existing_wins  int;
BEGIN
  SELECT value INTO v_correct_code FROM public.camp_info WHERE key = 'secret_page_password_2';

  -- Forgiving match: trimmed, case-insensitive. Empty/unset code => never correct.
  v_is_correct := v_correct_code IS NOT NULL
                  AND length(btrim(v_correct_code)) > 0
                  AND lower(btrim(p_code)) = lower(btrim(v_correct_code));

  IF v_is_correct THEN
    -- Serialize winner determination so only the first correct entry wins.
    PERFORM pg_advisory_xact_lock(hashtext('hsc26_secret_winner'));
    SELECT count(*) INTO v_existing_wins FROM public.secret_submissions WHERE is_winner = true;
    IF v_existing_wins = 0 THEN
      v_is_winner := true;
    END IF;
  END IF;

  INSERT INTO public.secret_submissions (first_name, last_name, campus, code_attempt, is_correct, is_winner)
  VALUES (btrim(p_first_name), btrim(p_last_name), btrim(p_campus), p_code, v_is_correct, v_is_winner);

  IF NOT v_is_correct THEN
    RETURN 'denied';
  ELSIF v_is_winner THEN
    RETURN 'winner';
  ELSE
    RETURN 'runner_up';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_secret_response(text, text, text, text) TO anon, authenticated;
