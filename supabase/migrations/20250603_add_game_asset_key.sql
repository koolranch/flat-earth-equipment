-- Add game_asset_key column to modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS game_asset_key TEXT;

-- Update Module 1 of the forklift course to have game_asset_key = 'module1'
UPDATE public.modules 
SET game_asset_key = 'module1'
WHERE course_id = (SELECT id FROM courses WHERE slug='forklift')
  AND "order" = 1; 