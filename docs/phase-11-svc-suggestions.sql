BEGIN;

-- Suggestions table for public submissions (serial tips, fault corrections, retrieval tips, etc.)
CREATE TABLE IF NOT EXISTS public.svc_user_suggestions (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('serial_note','fault_code','retrieval','plate_location','guide_feedback')),
  model TEXT,
  serial TEXT,
  code TEXT,
  title TEXT,
  details TEXT,
  photos TEXT[],
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','rejected','needs_review')),
  moderator TEXT,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lightweight moderation/audit log
CREATE TABLE IF NOT EXISTS public.svc_mod_audit (
  id BIGSERIAL PRIMARY KEY,
  suggestion_id BIGINT REFERENCES public.svc_user_suggestions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approve','reject','flag','note')),
  actor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for review queues
CREATE INDEX IF NOT EXISTS idx_svc_sug_brand_status ON public.svc_user_suggestions(brand, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_svc_sug_type ON public.svc_user_suggestions(suggestion_type);

-- Enable RLS and safe policies: allow anonymous INSERT only; reads/admin via server-side/service key
ALTER TABLE public.svc_user_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svc_mod_audit ENABLE ROW LEVEL SECURITY;

-- Public can insert suggestions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='svc_user_suggestions' AND policyname='sug_insert_anon') THEN
    CREATE POLICY sug_insert_anon ON public.svc_user_suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

-- No public SELECT by default (admin views via service role on server)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='svc_user_suggestions' AND policyname='sug_select_none') THEN
    CREATE POLICY sug_select_none ON public.svc_user_suggestions FOR SELECT USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='svc_mod_audit' AND policyname='audit_select_none') THEN
    CREATE POLICY audit_select_none ON public.svc_mod_audit FOR SELECT USING (false);
  END IF;
END $$;

COMMIT;
