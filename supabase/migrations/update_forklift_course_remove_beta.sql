-- Migration: Remove BETA and placeholder text from forklift course
-- Update the course title and description to production-ready values

UPDATE public.courses 
SET 
  title = 'Online Forklift Operator Certification',
  description = 'Complete OSHA-compliant forklift safety training with interactive demos and assessment.'
WHERE slug = 'forklift';

-- Verify the update
SELECT slug, title, description FROM public.courses WHERE slug = 'forklift'; 