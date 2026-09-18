-- WiTECH initial database schema
-- Strategy: TEXT primary keys are used intentionally to preserve existing frontend IDs
-- such as "academy", "lab", "evt-1" while still allowing database-generated IDs for
-- newly created records via DEFAULT gen_random_uuid()::text.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Divisions are the canonical organization groups. The "memberCount" and "photoCount"
-- fields are derived in the frontend and intentionally not stored here.
CREATE TABLE public.divisions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  short_name TEXT NOT NULL CHECK (length(trim(short_name)) > 0),
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  division_id TEXT NOT NULL REFERENCES public.divisions (id) ON DELETE RESTRICT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT NOT NULL,
  members TEXT[] NOT NULL DEFAULT '{}',
  award TEXT NOT NULL DEFAULT '',
  github_url TEXT,
  live_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE public.members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  role TEXT NOT NULL CHECK (length(trim(role)) > 0),
  division_id TEXT REFERENCES public.divisions (id) ON DELETE RESTRICT,
  year TEXT NOT NULL,
  avatar TEXT NOT NULL,
  github TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.albums (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  date DATE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT albums_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE public.album_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  album_id TEXT NOT NULL REFERENCES public.albums (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (length(trim(image_url)) > 0),
  sort_order INTEGER NOT NULL CHECK (sort_order >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (album_id, sort_order)
);

CREATE TABLE public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Workshop', 'Bootcamp', 'Seminar', 'Sharing Session')),
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  registration_open BOOLEAN NOT NULL DEFAULT FALSE,
  registration_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE TABLE public.faqs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  question TEXT NOT NULL CHECK (length(trim(question)) > 0),
  answer TEXT NOT NULL CHECK (length(trim(answer)) > 0),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_division_id ON public.projects (division_id);
CREATE INDEX idx_projects_status_featured ON public.projects (status, featured, sort_order, year, created_at DESC);
CREATE INDEX idx_members_division_id_active ON public.members (division_id, active, sort_order, name);
CREATE INDEX idx_events_date ON public.events (date, start_time, end_time);
CREATE INDEX idx_albums_date_sort_order ON public.albums (date DESC, sort_order, created_at DESC);
CREATE INDEX idx_album_photos_album_id_sort_order ON public.album_photos (album_id, sort_order);
CREATE INDEX idx_divisions_sort_order ON public.divisions (sort_order, created_at);
CREATE INDEX idx_faqs_sort_order ON public.faqs (sort_order, created_at);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.divisions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.albums
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.album_photos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public website reads only public data. The anon policy intentionally filters draft
-- projects at the database layer to preserve the current contract.
CREATE POLICY "Anonymous users can read divisions" ON public.divisions
FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can read active members" ON public.members
FOR SELECT TO anon USING (active = true);

CREATE POLICY "Anonymous users can read published projects" ON public.projects
FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Anonymous users can read albums" ON public.albums
FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can read album photos" ON public.album_photos
FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can read events" ON public.events
FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can read faqs" ON public.faqs
FOR SELECT TO anon USING (true);

-- Current authentication model is admin-only because public signup is off and manual
-- admin users are created by the platform. If non-admin authenticated users are added
-- later, this policy should be replaced with explicit admin authorization checks.
CREATE POLICY "Authenticated users can manage divisions" ON public.divisions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage projects" ON public.projects
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage members" ON public.members
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage albums" ON public.albums
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage album photos" ON public.album_photos
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage events" ON public.events
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage faqs" ON public.faqs
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

COMMIT;
