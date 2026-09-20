-- Grant PostgREST privileges for the already-created site_settings table.
BEGIN;

GRANT SELECT ON TABLE public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_settings TO authenticated;

COMMIT;
