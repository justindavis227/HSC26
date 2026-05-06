-- video_submissions table
CREATE TABLE IF NOT EXISTS public.video_submissions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  video_title  text NOT NULL,
  phone_number text NOT NULL,
  file_url     text NOT NULL,
  file_name    text NOT NULL,
  day_number   int NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  file_size    bigint
);

ALTER TABLE public.video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert video submissions"
  ON public.video_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can select video submissions"
  ON public.video_submissions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete video submissions"
  ON public.video_submissions FOR DELETE USING (auth.role() = 'authenticated');

-- Helper RPC so unauthenticated users can check their own phone for duplicates
CREATE OR REPLACE FUNCTION public.check_phone_submitted_today(phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.video_submissions
    WHERE phone_number = phone
    AND submitted_at::date = CURRENT_DATE
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_submitted_today TO public;

-- Storage bucket (private — admin-only reads, anyone can upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-submissions',
  'video-submissions',
  false,
  524288000,
  ARRAY['video/mp4', 'video/quicktime', 'video/mov']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Anyone can upload video submissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can upload video submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''video-submissions'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Authenticated can read video submissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can read video submissions" ON storage.objects FOR SELECT USING (bucket_id = ''video-submissions'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Authenticated can delete video submissions'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can delete video submissions" ON storage.objects FOR DELETE USING (bucket_id = ''video-submissions'' AND auth.role() = ''authenticated'')';
  END IF;
END $$;
