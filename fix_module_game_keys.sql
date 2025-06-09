-- First, let's see the current state
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 2%' 
   OR title ILIKE '%module 3%'
   OR title ILIKE '%inspection%'
   OR title ILIKE '%operating%'
ORDER BY "order";

-- Fix Module 2: Should have game_asset_key 'module2'
UPDATE modules 
SET game_asset_key = 'module2'
WHERE title ILIKE '%module 2%' 
   OR title ILIKE '%inspection%';

-- Fix Module 3: Should be a game with game_asset_key 'module3'
UPDATE modules 
SET 
  type = 'game',
  game_asset_key = 'module3'
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%operating%';

-- Verify the fixes
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 2%' 
   OR title ILIKE '%module 3%'
   OR title ILIKE '%inspection%'
   OR title ILIKE '%operating%'
ORDER BY "order"; 