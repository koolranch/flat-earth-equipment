-- Migration: Create failed_emails table for tracking email delivery failures
-- This table stores credentials for users whose welcome emails failed to send
-- so they can be manually recovered

CREATE TABLE IF NOT EXISTS public.failed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  password text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_failed_emails_unresolved ON public.failed_emails(created_at) WHERE resolved_at IS NULL;

ALTER TABLE public.failed_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can access (for security - contains passwords)
CREATE POLICY service_role_access ON public.failed_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

