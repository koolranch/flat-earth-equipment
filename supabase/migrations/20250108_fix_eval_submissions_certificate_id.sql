-- Fix eval_submissions table to accept text certificate_id instead of uuid
-- This allows demo certificates with string IDs like "test-123"

-- Drop the foreign key constraint first
ALTER TABLE public.eval_submissions 
DROP CONSTRAINT IF EXISTS eval_submissions_certificate_id_fkey;

-- Change certificate_id from uuid to text
ALTER TABLE public.eval_submissions 
ALTER COLUMN certificate_id TYPE text;

-- Recreate the index
DROP INDEX IF EXISTS eval_submissions_certificate_id_idx;
CREATE INDEX eval_submissions_certificate_id_idx ON public.eval_submissions(certificate_id);

-- Add comment explaining the change
COMMENT ON COLUMN public.eval_submissions.certificate_id IS 'Certificate ID - can be UUID for real enrollments or text for demo certificates'; 