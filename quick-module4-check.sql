-- Quick Module 4 Check and Fix
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Check current module structure
SELECT 
  'CURRENT MODULE STRUCTURE:' as status,
  id, 
  "order",
  title, 
  type, 
  game_asset_key,
  CASE WHEN intro_url IS NULL THEN '❌ NO VIDEO' ELSE '✅ HAS VIDEO' END as intro_status,
  CASE WHEN video_url IS NULL THEN '✅ NULL (correct for games)' ELSE '⚠️ HAS VIDEO_URL' END as video_status,
  CASE WHEN quiz_json IS NULL THEN '❌ NO QUIZ' ELSE '✅ HAS QUIZ' END as quiz_status
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- 2. Check if Module 4 exists
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ MODULE 4 MISSING - NEEDS TO BE CREATED'
    WHEN COUNT(*) = 1 THEN '✅ MODULE 4 EXISTS'
    ELSE '⚠️ MULTIPLE MODULE 4s FOUND'
  END as module4_status,
  COUNT(*) as count
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND (title ILIKE '%module 4%' OR "order" = 5);

-- 3. Fix Module 4 if it exists
UPDATE public.modules
SET 
  title = 'Module 4: Hazard Hunt',
  type = 'game',
  video_url = NULL,
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
  game_asset_key = 'module4',
  quiz_json = '[
    {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
    {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 5;

-- 4. Create Module 4 if it doesn't exist
INSERT INTO public.modules (course_id, "order", title, type, intro_url, game_asset_key, quiz_json)
SELECT 
  course.id,
  5,
  'Module 4: Hazard Hunt',
  'game',
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
  'module4',
  '[
    {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
    {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
  ]'::jsonb
FROM public.courses course
WHERE course.slug = 'forklift'
  AND NOT EXISTS (
    SELECT 1 FROM public.modules 
    WHERE course_id = course.id AND "order" = 5
  );

-- 5. Verify final result
SELECT 
  'FINAL RESULT:' as status,
  id, 
  "order",
  title, 
  type, 
  game_asset_key,
  LENGTH(game_asset_key) as key_length,
  intro_url IS NOT NULL as has_intro,
  video_url IS NULL as video_null_correct,
  quiz_json IS NOT NULL as has_quiz
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- 6. Show what the dashboard should see
SELECT 
  'DASHBOARD EXPECTATION:' as info,
  'Module 4 should show as "Interactive Demo" with "Hazard Hunt Game"' as display,
  'Type: game, Asset: module4, Video: modulefour.mp4' as technical_details; 