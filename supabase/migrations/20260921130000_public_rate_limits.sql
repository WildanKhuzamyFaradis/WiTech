BEGIN;

CREATE TABLE IF NOT EXISTS public.public_rate_limits (
  namespace TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, source_hash)
);
CREATE INDEX IF NOT EXISTS idx_public_rate_limits_updated_at ON public.public_rate_limits(updated_at);
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_public_rate_limit(
  p_namespace TEXT,
  p_source_hash TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE resulting_attempts INTEGER;
BEGIN
  IF p_namespace IS NULL OR pg_catalog.btrim(p_namespace) = '' OR p_source_hash IS NULL OR pg_catalog.btrim(p_source_hash) = '' OR p_limit < 1 OR p_window_seconds < 1 THEN RETURN FALSE; END IF;

  INSERT INTO public.public_rate_limits AS rl(namespace, source_hash, window_started_at, attempts, updated_at)
  VALUES (p_namespace, p_source_hash, pg_catalog.now(), 1, pg_catalog.now())
  ON CONFLICT (namespace, source_hash) DO UPDATE
  SET attempts = CASE
      WHEN pg_catalog.now() - rl.window_started_at >= pg_catalog.make_interval(secs => p_window_seconds) THEN 1
      ELSE rl.attempts + 1
    END,
    window_started_at = CASE
      WHEN pg_catalog.now() - rl.window_started_at >= pg_catalog.make_interval(secs => p_window_seconds) THEN pg_catalog.now()
      ELSE rl.window_started_at
    END,
    updated_at = pg_catalog.now()
  RETURNING attempts INTO resulting_attempts;

  RETURN resulting_attempts <= p_limit;
END;
$$;

REVOKE ALL ON TABLE public.public_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.public_rate_limits FROM service_role;
REVOKE ALL ON FUNCTION public.consume_public_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_public_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

COMMIT;
