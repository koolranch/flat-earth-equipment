-- Fix Module 1 and Module 2 configurations

-- Check current state
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 1%' 
   OR title ILIKE '%module 2%'
   OR title ILIKE '%pre-operation%'
   OR title ILIKE '%inspection%'
ORDER BY "order";

-- Fix Module 1: should have game_asset_key 'module1'
UPDATE modules 
SET game_asset_key = 'module1'
WHERE title ILIKE '%module 1%' 
   OR title ILIKE '%pre-operation%';

-- Fix Module 2: ensure it's type 'game' (not 'hybrid') and has correct game_asset_key
UPDATE modules 
SET 
  type = 'game',
  game_asset_key = 'module2'
WHERE title ILIKE '%module 2%' 
   AND title ILIKE '%8-point%';

-- Verify the fixes
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 1%' 
   OR title ILIKE '%module 2%'
   OR title ILIKE '%pre-operation%'
   OR title ILIKE '%inspection%'
ORDER BY "order"; 