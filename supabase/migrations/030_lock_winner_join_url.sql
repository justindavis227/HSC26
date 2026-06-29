-- Make the GroupMe winner-join URL private.
-- It was readable by anon because the secret page fetched it client-side.
-- Now: hidden from anon reads, and delivered ONLY to the gold winner via the
-- claim RPC (server-side). Admins still read/write it via the authenticated policy.

-- 1. Hide secret_winner_join_url from anonymous reads.
DROP POLICY IF EXISTS "Public read camp_info" ON public.camp_info;
CREATE POLICY "Public read camp_info" ON public.camp_info
  FOR SELECT
  USING (key NOT LIKE 'secret_page_password%' AND key <> 'secret_winner_join_url');

-- 2. Return join_url in the claim response ONLY for the gold ticket (#1).
CREATE OR REPLACE FUNCTION public.claim_secret_ticket(
  p_first_name text,
  p_last_name  text,
  p_campus     text,
  p_code       text,
  p_device_id  text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_code text;
  v_is_correct   boolean;
  v_existing     record;
  v_next         int;
  v_tier         text;
  v_max          int;
  v_cap          int := 3500;
  v_join_url     text;
BEGIN
  SELECT value INTO v_correct_code FROM public.camp_info WHERE key = 'secret_page_password_2';

  v_is_correct := v_correct_code IS NOT NULL
                  AND length(btrim(v_correct_code)) > 0
                  AND lower(p_code) = lower(v_correct_code);

  IF NOT v_is_correct THEN
    INSERT INTO public.secret_submissions (first_name, last_name, campus, code_attempt, is_correct, is_winner, device_id)
    VALUES (btrim(p_first_name), btrim(p_last_name), btrim(p_campus), p_code, false, false, p_device_id);
    RETURN jsonb_build_object('status', 'denied');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('hsc26_secret_winner'));

  -- One ticket per device: return the existing ticket if already claimed.
  IF p_device_id IS NOT NULL AND length(btrim(p_device_id)) > 0 THEN
    SELECT ticket_number, tier INTO v_existing
      FROM public.secret_submissions
     WHERE device_id = p_device_id AND ticket_number IS NOT NULL
     ORDER BY ticket_number ASC
     LIMIT 1;
    IF FOUND THEN
      IF v_existing.tier = 'gold' THEN
        SELECT value INTO v_join_url FROM public.camp_info WHERE key = 'secret_winner_join_url';
      END IF;
      RETURN jsonb_build_object('status', 'issued', 'already', true,
        'ticket_number', v_existing.ticket_number, 'tier', v_existing.tier)
        || CASE WHEN v_join_url IS NOT NULL THEN jsonb_build_object('join_url', v_join_url) ELSE '{}'::jsonb END;
    END IF;
  END IF;

  SELECT coalesce(max(ticket_number), 0) INTO v_max FROM public.secret_submissions;
  v_next := v_max + 1;

  IF v_next > v_cap THEN
    INSERT INTO public.secret_submissions (first_name, last_name, campus, code_attempt, is_correct, is_winner, tier, device_id)
    VALUES (btrim(p_first_name), btrim(p_last_name), btrim(p_campus), p_code, true, false, 'sold_out', p_device_id);
    RETURN jsonb_build_object('status', 'sold_out');
  END IF;

  v_tier := CASE
    WHEN v_next = 1 THEN 'gold'
    WHEN v_next BETWEEN 2 AND 50 THEN 'silver'
    WHEN v_next BETWEEN 51 AND 100 THEN 'bronze'
    ELSE 'blue'
  END;

  IF v_tier = 'gold' THEN
    SELECT value INTO v_join_url FROM public.camp_info WHERE key = 'secret_winner_join_url';
  END IF;

  INSERT INTO public.secret_submissions (first_name, last_name, campus, code_attempt, is_correct, is_winner, ticket_number, tier, device_id)
  VALUES (btrim(p_first_name), btrim(p_last_name), btrim(p_campus), p_code, true, (v_next = 1), v_next, v_tier, p_device_id);

  RETURN jsonb_build_object('status', 'issued', 'already', false, 'ticket_number', v_next, 'tier', v_tier)
    || CASE WHEN v_join_url IS NOT NULL THEN jsonb_build_object('join_url', v_join_url) ELSE '{}'::jsonb END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_secret_ticket(text, text, text, text, text) TO anon, authenticated;
