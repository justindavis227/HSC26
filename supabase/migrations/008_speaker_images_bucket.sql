-- Public storage bucket for speaker headshots (5 MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'speaker-images',
  'speaker-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public can view speaker images'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view speaker images" ON storage.objects FOR SELECT USING (bucket_id = ''speaker-images'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can upload speaker images'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can upload speaker images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''speaker-images'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can update speaker images'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can update speaker images" ON storage.objects FOR UPDATE USING (bucket_id = ''speaker-images'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated can delete speaker images'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete speaker images" ON storage.objects FOR DELETE USING (bucket_id = ''speaker-images'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;
