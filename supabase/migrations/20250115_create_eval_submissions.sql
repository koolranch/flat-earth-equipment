-- Create eval_submissions table for digital supervisor evaluations
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.eval_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id     uuid REFERENCES public.enrollments(id),
  supervisor_email   text NOT NULL,
  equipment_type     text,
  checks_json        jsonb,
  signature_url      text,
  created_at         timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eval_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to create eval submissions (supervisors don't need accounts)
CREATE POLICY "eval_submissions_create" ON public.eval_submissions
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Allow users to view eval submissions for their own certificates
CREATE POLICY "eval_submissions_view_own" ON public.eval_submissions
  FOR SELECT 
  USING (
    certificate_id IN (
      SELECT id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS eval_submissions_certificate_id_idx ON public.eval_submissions(certificate_id);
CREATE INDEX IF NOT EXISTS eval_submissions_supervisor_email_idx ON public.eval_submissions(supervisor_email);

-- Add comment
COMMENT ON TABLE public.eval_submissions IS 'Stores digital supervisor evaluation submissions with signatures'; 