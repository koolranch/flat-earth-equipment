-- Check current Module 3 video configuration
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%operating%';

-- Move the video URL from video_url to intro_url for Module 3
UPDATE modules 
SET 
  intro_url = video_url,
  video_url = null
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%operating%';

-- Verify the fix
SELECT 
  id, 
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url,
  "order"
FROM modules 
WHERE title ILIKE '%module 3%' 
   OR title ILIKE '%operating%'; 