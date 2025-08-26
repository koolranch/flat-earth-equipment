BEGIN;

-- 1) Add IP column for basic rate limiting on submissions
ALTER TABLE public.svc_user_suggestions ADD COLUMN IF NOT EXISTS ip inet;
CREATE INDEX IF NOT EXISTS idx_svc_sug_ip_time ON public.svc_user_suggestions(ip, created_at DESC);

-- 2) Public, moderated 'Community Notes' table (what we publish after review)
CREATE TABLE IF NOT EXISTS public.svc_public_notes (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('serial','fault','retrieval','plate','guide')),
  model TEXT,
  code TEXT,
  content TEXT NOT NULL,
  source TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Everyone can read notes; only service role writes (service role bypasses RLS).
ALTER TABLE public.svc_public_notes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='svc_public_notes' AND policyname='notes_select_anon') THEN
    CREATE POLICY notes_select_anon ON public.svc_public_notes FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notes_brand_cat ON public.svc_public_notes(brand, category, created_at DESC);

COMMIT;
