-- WiTECH Supabase Storage Migration
-- Provisions the public 'witech-media' bucket and sets up access policies.
--
-- SECURITY NOTICE:
-- The write policies (INSERT, UPDATE, DELETE) are granted TO authenticated users.
-- This authenticated-write policy is TEMPORARY because the current project
-- treats authenticated users as administrators (public user signup is disabled).
-- In a future hardening phase, this should be tightened to explicit admin RBAC
-- (e.g. auth.jwt() ->> 'role' = 'admin' or custom claims) without altering bucket structure.

BEGIN;

-- 1. Provision the 'witech-media' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'witech-media',
  'witech-media',
  true,
  5242880, -- 5 MB limit per object
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage object policies on storage.objects

-- Public read access: anyone (anon and authenticated) can view images
DROP POLICY IF EXISTS "Public media read access" ON storage.objects;
CREATE POLICY "Public media read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'witech-media');

-- Temporary admin write access: authenticated accounts can insert objects
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'witech-media');

-- Temporary admin update access: authenticated accounts can update objects
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'witech-media')
WITH CHECK (bucket_id = 'witech-media');

-- Temporary admin delete access: authenticated accounts can delete objects
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'witech-media');

COMMIT;
