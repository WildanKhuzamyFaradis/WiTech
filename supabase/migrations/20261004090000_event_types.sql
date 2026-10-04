-- Database-owned event type catalog for the admin dropdown.
BEGIN;

CREATE TABLE public.event_types (
  name TEXT PRIMARY KEY CHECK (name = btrim(name) AND length(name) BETWEEN 1 AND 100)
);

INSERT INTO public.event_types (name)
VALUES ('Workshop'), ('Bootcamp'), ('Seminar'), ('Sharing Session'), ('Hangout');

-- Preserve all types already used, including production additions.
INSERT INTO public.event_types (name)
SELECT DISTINCT type FROM public.events
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.event_types FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.event_types TO authenticated;
CREATE POLICY "Admins can read event types"
ON public.event_types FOR SELECT TO authenticated
USING (private.is_admin());

-- The catalog replaces the fixed list while continuing database validation.
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE public.events ADD CONSTRAINT events_type_fkey
  FOREIGN KEY (type) REFERENCES public.event_types(name)
  ON UPDATE CASCADE ON DELETE RESTRICT;

COMMIT;
