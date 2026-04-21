-- Migration: create public.push_tokens
-- Stores Expo push tokens for mobile users so the server can send push notifications.
-- Writes are service-role only (no INSERT/UPDATE policy for authed users).
-- Rollback: run 20260420000000_create_push_tokens.rollback.sql

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token       text        NOT NULL,
  platform    text        NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users may read their own tokens (e.g. for debugging)
CREATE POLICY push_tokens_select_own ON public.push_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users may delete their own tokens (e.g. on logout)
CREATE POLICY push_tokens_delete_own ON public.push_tokens
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT or UPDATE policy for authenticated users — all writes go through
-- the service role via /api/mobile/register-push-token.

COMMENT ON TABLE  public.push_tokens                IS 'Expo push tokens for server-originated push notifications.';
COMMENT ON COLUMN public.push_tokens.token          IS 'Expo push token string, e.g. ExponentPushToken[xxxx].';
COMMENT ON COLUMN public.push_tokens.platform       IS 'ios | android | web — kept in sync on re-registration.';
COMMENT ON COLUMN public.push_tokens.updated_at     IS 'Refreshed on every upsert so stale tokens can be pruned.';
