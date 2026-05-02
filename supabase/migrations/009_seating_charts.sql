-- Storage bucket for seating chart files (images + PDFs, 20 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seating-charts',
  'seating-charts',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public can view seating charts') THEN
    EXECUTE 'CREATE POLICY "Public can view seating charts" ON storage.objects FOR SELECT USING (bucket_id = ''seating-charts'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can upload seating charts') THEN
    EXECUTE 'CREATE POLICY "Authenticated can upload seating charts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''seating-charts'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can update seating charts') THEN
    EXECUTE 'CREATE POLICY "Authenticated can update seating charts" ON storage.objects FOR UPDATE USING (bucket_id = ''seating-charts'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can delete seating charts') THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete seating charts" ON storage.objects FOR DELETE USING (bucket_id = ''seating-charts'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

-- One row per day (unique on day), tracks file URL + storage path for clean deletes
CREATE TABLE IF NOT EXISTS seating_charts (
  id         serial primary key,
  day        text        not null unique,
  day_order  int         not null default 0,
  file_url   text        not null default '',
  file_name  text        not null default '',
  file_path  text        not null default '',
  updated_at timestamptz not null default now()
);

ALTER TABLE seating_charts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seating_charts' AND policyname = 'Public can read seating_charts') THEN
    EXECUTE 'CREATE POLICY "Public can read seating_charts" ON seating_charts FOR SELECT USING (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seating_charts' AND policyname = 'Authenticated can modify seating_charts') THEN
    EXECUTE 'CREATE POLICY "Authenticated can modify seating_charts" ON seating_charts FOR ALL USING (auth.role() = ''authenticated'')';
  END IF;
END $$;
