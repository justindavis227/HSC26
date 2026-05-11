ALTER TABLE public.decision_guide
  ADD COLUMN IF NOT EXISTS banner_visible boolean NOT NULL DEFAULT true;
