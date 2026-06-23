-- Secret Page 2nd code matching rules: case-INSENSITIVE, but spaces MATTER.
--
-- Replaces submit_secret_response so the code comparison lowercases both sides
-- (capitalization doesn't matter) but does NOT trim the user's input — so any
-- difference in spaces (leading, trailing, or internal) counts as wrong.
--
-- The "is a code set?" guard still uses btrim() so a whitespace-only stored
-- value is treated as "not set" (everyone denied). The admin editor trims the
-- stored code on save, so the correct value has no stray leading/trailing space.

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

  -- Case-insensitive match; spaces are significant (no trim on the comparison).
  -- Guard: empty / whitespace-only stored code => never correct.
  v_is_correct := v_correct_code IS NOT NULL
                  AND length(btrim(v_correct_code)) > 0
                  AND lower(p_code) = lower(v_correct_code);

  IF v_is_correct THEN
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
