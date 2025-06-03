-- Add type column to modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video';

-- Update Module 1 of the forklift course to be a game
UPDATE public.modules 
SET type = 'game' 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift') 
  AND "order" = 1;
