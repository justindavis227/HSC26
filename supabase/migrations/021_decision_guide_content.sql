-- Drop old generic file-list decision_guide table and replace with structured content
DROP TABLE IF EXISTS decision_guide CASCADE;

CREATE TABLE public.decision_guide (
  id                      int PRIMARY KEY DEFAULT 1,
  baptism_class_info      text NOT NULL DEFAULT '',
  step1_description       text NOT NULL DEFAULT '',
  step2_decisions         jsonb NOT NULL DEFAULT '[]'::jsonb,
  step2_warning           text NOT NULL DEFAULT '',
  step2_form_url          text NOT NULL DEFAULT '',
  step3_description       text NOT NULL DEFAULT '',
  baptism_guide_url       text NOT NULL DEFAULT '',
  thirty_three_things_url text NOT NULL DEFAULT '',
  next_step_image_1_url   text NOT NULL DEFAULT '',
  next_step_image_2_url   text NOT NULL DEFAULT '',
  next_step_image_3_url   text NOT NULL DEFAULT '',
  next_step_image_4_url   text NOT NULL DEFAULT '',
  updated_at              timestamptz DEFAULT now()
);

-- Enforce single-row via CHECK
ALTER TABLE public.decision_guide ADD CONSTRAINT decision_guide_single_row CHECK (id = 1);

ALTER TABLE public.decision_guide ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read decision_guide"
  ON public.decision_guide FOR SELECT USING (true);

CREATE POLICY "Authenticated can modify decision_guide"
  ON public.decision_guide FOR ALL USING (auth.role() = 'authenticated');

-- Seed with initial content
INSERT INTO public.decision_guide (
  id,
  baptism_class_info,
  step1_description,
  step2_decisions,
  step2_warning,
  step2_form_url,
  step3_description
) VALUES (
  1,
  'Baptism Class — June 26th · 1:30–2:30pm & 3:00–4:00pm · Honors North',
  'Have a gospel conversation first. Use the Bridge Illustration to help the student consider where they are with Christ.',
  '["Get baptized", "Re-commitment to Jesus", "Go into full time ministry"]'::jsonb,
  'Parents of minors must be contacted for all baptism decisions.',
  'https://my.southeastchristian.org/decided',
  'Work with your Staff / Team Leader about student decisions. Help each student take their next step!'
);
