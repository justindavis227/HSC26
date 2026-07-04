-- ============================================================================
-- Phase 2 defense-in-depth hardening. APPLIED to prod 2026-07-03 (post-camp)
-- via MCP apply_migration. None of this was the breach vector (that was
-- migration 028). Closes the lower-priority findings from the 2026-06-29
-- security audit. Verified after apply: 7 "Public Bucket Allows Listing"
-- advisor warnings gone, search_path warning gone, speaker headshots load,
-- write policies + private video-submissions SELECT intact.
--
-- Pre-verified safe:
--   * The codebase makes ZERO storage `.list()` calls. All image/file access is
--     by direct public URL (getPublicUrl -> stored -> <img src>). All 7 buckets
--     below are public=true, so the public object endpoint serves files WITHOUT
--     needing a broad SELECT policy. Dropping the listing policies therefore
--     stops anonymous bucket enumeration WITHOUT breaking any live page.
--   * video-submissions bucket is private (public=false) and its SELECT is
--     already authenticated-only — intentionally left untouched.
--   * check_phone_submitted_today keeps anon EXECUTE (the public video
--     submission form needs it); we only pin its search_path.

-- ----------------------------------------------------------------------------
-- 1. Stop anonymous LISTING of public storage buckets.
--    Public object downloads keep working via the public bucket endpoint.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view campus documents"     ON storage.objects;
DROP POLICY IF EXISTS "Public can view decision guide files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view group cards"          ON storage.objects;
DROP POLICY IF EXISTS "Public can view seating charts"       ON storage.objects;
DROP POLICY IF EXISTS "Public can view speaker images"       ON storage.objects;
DROP POLICY IF EXISTS "Public read announcement-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read camp-map"                 ON storage.objects;

-- ----------------------------------------------------------------------------
-- 2. Pin the function search_path (deterministic schema resolution).
--    Behavior is unchanged; anon EXECUTE is intentionally preserved.
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.check_phone_submitted_today(text) SET search_path = public;

-- ============================================================================
-- ROLLBACK (if any public image/file fails to load after applying):
--
-- CREATE POLICY "Public can view campus documents"     ON storage.objects FOR SELECT USING (bucket_id = 'campus-documents');
-- CREATE POLICY "Public can view decision guide files" ON storage.objects FOR SELECT USING (bucket_id = 'decision-guide-files');
-- CREATE POLICY "Public can view group cards"          ON storage.objects FOR SELECT USING (bucket_id = 'group-cards');
-- CREATE POLICY "Public can view seating charts"       ON storage.objects FOR SELECT USING (bucket_id = 'seating-charts');
-- CREATE POLICY "Public can view speaker images"       ON storage.objects FOR SELECT USING (bucket_id = 'speaker-images');
-- CREATE POLICY "Public read announcement-attachments" ON storage.objects FOR SELECT USING (bucket_id = 'announcement-attachments');
-- CREATE POLICY "Public read camp-map"                 ON storage.objects FOR SELECT USING (bucket_id = 'camp-map');
-- ALTER FUNCTION public.check_phone_submitted_today(text) RESET search_path;
-- ============================================================================
