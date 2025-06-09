-- SAFE REVIEW - Shows what would be deleted/changed WITHOUT making changes
-- Run this first to see what the fix would do

-- 1. Show current state of ALL modules
SELECT 
  'CURRENT STATE:' as status,
  id, 
  "order",
  title, 
  type, 
  game_asset_key, 
  intro_url,
  CASE WHEN video_url IS NULL THEN 'NULL' ELSE 'HAS_VALUE' END as video_url_status
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- 2. Show what would be DELETED (corrupted modules)
SELECT 
  'WOULD BE DELETED:' as action,
  id, 
  "order",
  title, 
  type, 
  game_asset_key, 
  'REASON: ' || 
  CASE 
    WHEN title ILIKE '%module 2%' AND game_asset_key != 'module2' THEN 'Title/key mismatch (Module 2)'
    WHEN title ILIKE '%module 3%' AND game_asset_key != 'module3' THEN 'Title/key mismatch (Module 3)'
    WHEN title ILIKE '%module 4%' AND game_asset_key != 'module4' THEN 'Title/key mismatch (Module 4)'
    WHEN type = 'game' AND game_asset_key IS NULL THEN 'Game module missing asset key'
    WHEN title ILIKE '%test%' THEN 'Test entry'
    WHEN title ILIKE '%duplicate%' THEN 'Duplicate entry'
    ELSE 'Other'
  END as deletion_reason
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND (
    -- Same conditions as the DELETE statement
    (title ILIKE '%module 2%' AND game_asset_key != 'module2') OR
    (title ILIKE '%module 3%' AND game_asset_key != 'module3') OR
    (title ILIKE '%module 4%' AND game_asset_key != 'module4') OR
    (type = 'game' AND game_asset_key IS NULL) OR
    title ILIKE '%test%' OR title ILIKE '%duplicate%'
  )
ORDER BY "order";

-- 3. Show what modules would REMAIN after cleanup
SELECT 
  'WOULD REMAIN:' as action,
  id, 
  "order",
  title, 
  type, 
  game_asset_key
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND NOT (
    -- Inverse of the DELETE conditions
    (title ILIKE '%module 2%' AND game_asset_key != 'module2') OR
    (title ILIKE '%module 3%' AND game_asset_key != 'module3') OR
    (title ILIKE '%module 4%' AND game_asset_key != 'module4') OR
    (type = 'game' AND game_asset_key IS NULL) OR
    title ILIKE '%test%' OR title ILIKE '%duplicate%'
  )
ORDER BY "order";

-- 4. Check if you have other courses that would be untouched
SELECT 
  'OTHER COURSES (SAFE):' as status,
  slug,
  title,
  (SELECT COUNT(*) FROM modules WHERE course_id = courses.id) as module_count
FROM courses 
WHERE slug != 'forklift';

-- 5. Count total user progress/enrollments (will be preserved)
SELECT 
  'USER DATA (PRESERVED):' as status,
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT user_id) as unique_users
FROM enrollments; 