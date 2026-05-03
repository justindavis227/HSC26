-- Storage bucket for campus documents: small group zone maps, PDFs, etc. (20 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campus-documents',
  'campus-documents',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public can view campus documents') THEN
    EXECUTE 'CREATE POLICY "Public can view campus documents" ON storage.objects FOR SELECT USING (bucket_id = ''campus-documents'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can upload campus documents') THEN
    EXECUTE 'CREATE POLICY "Authenticated can upload campus documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''campus-documents'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can update campus documents') THEN
    EXECUTE 'CREATE POLICY "Authenticated can update campus documents" ON storage.objects FOR UPDATE USING (bucket_id = ''campus-documents'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can delete campus documents') THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete campus documents" ON storage.objects FOR DELETE USING (bucket_id = ''campus-documents'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Document attachment for each campus (small group zone map or guide)
ALTER TABLE campus_times
  ADD COLUMN IF NOT EXISTS small_group_document_url  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS small_group_document_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS small_group_document_path text NOT NULL DEFAULT '';
