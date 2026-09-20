-- Public site settings managed by administrators.
BEGIN;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY CHECK (key IN ('logo_url')),
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_settings TO authenticated;

DROP POLICY IF EXISTS "Anonymous users can read site settings" ON public.site_settings;
CREATE POLICY "Anonymous users can read site settings"
ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

INSERT INTO public.site_settings (key, value)
VALUES ('logo_url', '/logo.png')
ON CONFLICT (key) DO NOTHING;

COMMIT;
