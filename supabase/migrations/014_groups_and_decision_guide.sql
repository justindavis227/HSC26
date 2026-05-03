-- ── group-cards storage bucket ────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('group-cards', 'group-cards', true, 20971520,
        ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public can view group cards') THEN
    EXECUTE 'CREATE POLICY "Public can view group cards" ON storage.objects FOR SELECT USING (bucket_id = ''group-cards'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can upload group cards') THEN
    EXECUTE 'CREATE POLICY "Authenticated can upload group cards" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''group-cards'' AND auth.role() = ''authenticated'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can update group cards') THEN
    EXECUTE 'CREATE POLICY "Authenticated can update group cards" ON storage.objects FOR UPDATE USING (bucket_id = ''group-cards'' AND auth.role() = ''authenticated'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can delete group cards') THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete group cards" ON storage.objects FOR DELETE USING (bucket_id = ''group-cards'' AND auth.role() = ''authenticated'')'; END IF; END $$;

-- ── decision-guide-files storage bucket ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('decision-guide-files', 'decision-guide-files', true, 20971520,
        ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Public can view decision guide files') THEN
    EXECUTE 'CREATE POLICY "Public can view decision guide files" ON storage.objects FOR SELECT USING (bucket_id = ''decision-guide-files'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can upload decision guide files') THEN
    EXECUTE 'CREATE POLICY "Authenticated can upload decision guide files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''decision-guide-files'' AND auth.role() = ''authenticated'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can update decision guide files') THEN
    EXECUTE 'CREATE POLICY "Authenticated can update decision guide files" ON storage.objects FOR UPDATE USING (bucket_id = ''decision-guide-files'' AND auth.role() = ''authenticated'')'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Authenticated can delete decision guide files') THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete decision guide files" ON storage.objects FOR DELETE USING (bucket_id = ''decision-guide-files'' AND auth.role() = ''authenticated'')'; END IF; END $$;

-- ── group_cards table — one slot per day label ────────────────────────────────
CREATE TABLE IF NOT EXISTS group_cards (
  id         serial primary key,
  day_label  text        not null unique,
  sort_order int         not null default 0,
  file_url   text        not null default '',
  file_name  text        not null default '',
  file_path  text        not null default '',
  updated_at timestamptz not null default now()
);
ALTER TABLE group_cards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_cards' AND policyname='Public can read group_cards') THEN
    EXECUTE 'CREATE POLICY "Public can read group_cards" ON group_cards FOR SELECT USING (true)'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_cards' AND policyname='Authenticated can modify group_cards') THEN
    EXECUTE 'CREATE POLICY "Authenticated can modify group_cards" ON group_cards FOR ALL USING (auth.role() = ''authenticated'')'; END IF; END $$;

-- ── decision_guide table — ordered list of uploaded resources ─────────────────
CREATE TABLE IF NOT EXISTS decision_guide (
  id         serial primary key,
  sort_order int         not null default 0,
  title      text        not null default '',
  file_url   text        not null default '',
  file_name  text        not null default '',
  file_path  text        not null default '',
  updated_at timestamptz not null default now()
);
ALTER TABLE decision_guide ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decision_guide' AND policyname='Public can read decision_guide') THEN
    EXECUTE 'CREATE POLICY "Public can read decision_guide" ON decision_guide FOR SELECT USING (true)'; END IF; END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='decision_guide' AND policyname='Authenticated can modify decision_guide') THEN
    EXECUTE 'CREATE POLICY "Authenticated can modify decision_guide" ON decision_guide FOR ALL USING (auth.role() = ''authenticated'')'; END IF; END $$;
