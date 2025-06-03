-- Manual database update script
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Add type column to modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'video';

-- Step 2: Update Module 1 of the forklift course to be a game
-- First, let's see what courses exist:
-- SELECT * FROM public.courses;

-- Update Module 1 to be a game (adjust course slug if needed)
UPDATE public.modules 
SET type = 'game' 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift') 
  AND "order" = 1;

-- Verify the update worked:
-- SELECT m.*, c.slug as course_slug 
-- FROM public.modules m 
-- JOIN public.courses c ON m.course_id = c.id 
-- WHERE c.slug = 'forklift' 
-- ORDER BY m."order"; 