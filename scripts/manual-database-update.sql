-- Add the game_asset_key column to the modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS game_asset_key TEXT;

-- Update Module 1 of the forklift course to be a game
UPDATE public.modules 
SET 
  type = 'game',
  game_asset_key = 'module1'
WHERE 
  course_id = (SELECT id FROM courses WHERE slug = 'forklift') 
  AND "order" = 1;

-- Verify the update worked
SELECT 
  m.id,
  m.title,
  m."order",
  m.type,
  m.game_asset_key,
  c.title as course_title
FROM modules m
JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'forklift'
ORDER BY m."order"; 