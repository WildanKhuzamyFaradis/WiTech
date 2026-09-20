-- Database-backed administrator allowlist. Apply before inserting the first admin.
BEGIN;
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;
DROP POLICY IF EXISTS "Users can read their own admin membership" ON public.admin_users;
CREATE POLICY "Users can read their own admin membership" ON public.admin_users FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()); $$;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
DROP POLICY IF EXISTS "Authenticated users can manage divisions" ON public.divisions;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can manage album photos" ON public.album_photos;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage divisions" ON public.divisions FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage members" ON public.members FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage albums" ON public.albums FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage album photos" ON public.album_photos FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
CREATE POLICY "Admins can upload WiTECH media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'witech-media' AND private.is_admin());
CREATE POLICY "Admins can update WiTECH media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'witech-media' AND private.is_admin()) WITH CHECK (bucket_id = 'witech-media' AND private.is_admin());
CREATE POLICY "Admins can delete WiTECH media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'witech-media' AND private.is_admin());
COMMIT;
