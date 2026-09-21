BEGIN;

CREATE TABLE IF NOT EXISTS public.member_photo_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  division_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  linkedin_url TEXT,
  github_url TEXT,
  storage_path TEXT NOT NULL UNIQUE CHECK (storage_path LIKE 'pending/%'),
  original_filename TEXT NOT NULL CHECK (char_length(trim(original_filename)) BETWEEN 1 AND 255),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'pending', 'used', 'rejected')),
  used_by_member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_member_photo_submissions_status_created ON public.member_photo_submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_photo_submissions_division ON public.member_photo_submissions(division_id);

DROP TRIGGER IF EXISTS set_updated_at ON public.member_photo_submissions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.member_photo_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.member_photo_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read member photo submissions" ON public.member_photo_submissions;
DROP POLICY IF EXISTS "Admins can manage member photo submissions" ON public.member_photo_submissions;
CREATE POLICY "Admins can read member photo submissions" ON public.member_photo_submissions FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admins can manage member photo submissions" ON public.member_photo_submissions FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('member-submissions', 'member-submissions', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Admins can read member submissions storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage member submissions storage" ON storage.objects;
CREATE POLICY "Admins can read member submissions storage" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'member-submissions' AND private.is_admin());
CREATE POLICY "Admins can manage member submissions storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'member-submissions' AND private.is_admin()) WITH CHECK (bucket_id = 'member-submissions' AND private.is_admin());

COMMIT;

BEGIN;

-- Safe retries and atomic admin promotion claims.
ALTER TABLE public.member_photo_submissions DROP CONSTRAINT IF EXISTS member_photo_submissions_status_check;
ALTER TABLE public.member_photo_submissions ADD CONSTRAINT member_photo_submissions_status_check CHECK (status IN ('uploading', 'processing', 'pending', 'used', 'rejected'));

CREATE TABLE IF NOT EXISTS public.photo_submission_rate_limits (
  source_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.photo_submission_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_photo_submission_rate(p_source_hash TEXT, p_limit INTEGER DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_row public.photo_submission_rate_limits%ROWTYPE;
  next_attempts INTEGER;
BEGIN
  IF p_source_hash IS NULL OR char_length(p_source_hash) < 16 OR p_limit < 1 THEN
    RETURN FALSE;
  END IF;
  SELECT * INTO current_row FROM public.photo_submission_rate_limits WHERE source_hash = p_source_hash FOR UPDATE;
  IF NOT FOUND OR now() - current_row.window_started_at >= interval '1 hour' THEN
    INSERT INTO public.photo_submission_rate_limits(source_hash, window_started_at, attempts, updated_at)
    VALUES (p_source_hash, now(), 1, now())
    ON CONFLICT (source_hash) DO UPDATE SET window_started_at = EXCLUDED.window_started_at, attempts = 1, updated_at = now();
    RETURN TRUE;
  END IF;
  next_attempts := current_row.attempts + 1;
  UPDATE public.photo_submission_rate_limits SET attempts = next_attempts, updated_at = now() WHERE source_hash = p_source_hash;
  RETURN next_attempts <= p_limit;
END;
$$;
REVOKE ALL ON TABLE public.photo_submission_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_photo_submission_rate(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_photo_submission_rate(TEXT, INTEGER) TO service_role;

COMMIT;


