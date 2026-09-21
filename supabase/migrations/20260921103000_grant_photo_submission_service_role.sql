BEGIN;

-- The photo submission API uses the server-only service_role key.
GRANT SELECT ON TABLE public.divisions TO service_role;
GRANT SELECT ON TABLE public.admin_users TO service_role;
GRANT SELECT, UPDATE ON TABLE public.members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.member_photo_submissions TO service_role;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_photo_submission_rate(TEXT, INTEGER) TO service_role;

COMMIT;