BEGIN;

ALTER TABLE public.member_photo_submissions
  ALTER COLUMN division_id DROP NOT NULL;

COMMIT;
