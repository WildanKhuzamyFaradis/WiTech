BEGIN;

GRANT SELECT ON TABLE
  public.divisions,
  public.projects,
  public.members,
  public.albums,
  public.album_photos,
  public.events,
  public.faqs
TO anon;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.divisions,
  public.projects,
  public.members,
  public.albums,
  public.album_photos,
  public.events,
  public.faqs
FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.divisions,
  public.projects,
  public.members,
  public.albums,
  public.album_photos,
  public.events,
  public.faqs
TO authenticated;

COMMIT;