-- Create supervisor_leads table for capturing safety manager contacts
CREATE TABLE IF NOT EXISTS public.supervisor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_email TEXT NOT NULL,
  supervisor_name TEXT,
  company TEXT,
  trainee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  enrollment_id UUID,
  source TEXT DEFAULT 'practical_invite',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Marketing tracking
  email_opened BOOLEAN DEFAULT FALSE,
  link_clicked BOOLEAN DEFAULT FALSE,
  evaluation_completed BOOLEAN DEFAULT FALSE,
  
  -- Deduplication
  UNIQUE(supervisor_email, enrollment_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_supervisor_leads_email ON public.supervisor_leads(supervisor_email);
CREATE INDEX IF NOT EXISTS idx_supervisor_leads_company ON public.supervisor_leads(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_supervisor_leads_created ON public.supervisor_leads(created_at DESC);

-- RLS policies
ALTER TABLE public.supervisor_leads ENABLE ROW LEVEL SECURITY;

-- Service role has full access
DROP POLICY IF EXISTS service_full_access ON public.supervisor_leads;
CREATE POLICY service_full_access ON public.supervisor_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only see their own invites
DROP POLICY IF EXISTS users_own_invites ON public.supervisor_leads;
CREATE POLICY users_own_invites ON public.supervisor_leads
  FOR SELECT
  TO authenticated
  USING (trainee_user_id = auth.uid());

COMMENT ON TABLE public.supervisor_leads IS 'Captures safety manager/supervisor contacts from practical evaluation invites for marketing outreach';
COMMENT ON COLUMN public.supervisor_leads.source IS 'How we got this lead: practical_invite, trainer_referral, etc.';

