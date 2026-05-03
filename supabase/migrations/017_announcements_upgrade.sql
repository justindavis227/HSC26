-- Rich text content and scheduling for announcements
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS content_html text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Attachment files linked to announcements
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id          bigint generated always as identity primary key,
  announcement_id uuid not null references announcements(id) on delete cascade,
  file_url    text not null,
  file_name   text not null,
  file_type   text not null check (file_type in ('image', 'pdf')),
  created_at  timestamptz default now()
);

ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read announcement_attachments"
  ON announcement_attachments FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can manage announcement_attachments"
  ON announcement_attachments FOR ALL TO authenticated USING (true);

-- Storage bucket for announcement attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-attachments', 'announcement-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read announcement-attachments"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'announcement-attachments');

CREATE POLICY "Authenticated upload announcement-attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'announcement-attachments');

CREATE POLICY "Authenticated delete announcement-attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'announcement-attachments');
