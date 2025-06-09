-- Check current Module 3 configuration
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  order_position
FROM modules 
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%balance%'
   OR order_position = 3
ORDER BY order_position;

-- Update Module 3 to be a game type with the correct configuration
UPDATE modules 
SET 
  type = 'game',
  game_asset_key = 'module3'
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%balance%'
   OR order_position = 3;

-- Verify the update
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  order_position
FROM modules 
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%balance%'
   OR order_position = 3
ORDER BY order_position; 