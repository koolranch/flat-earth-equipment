-- Fix Module 4: Set it up as a game with correct configuration to match working modules
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's see the current state of all modules
SELECT 
  id, 
  "order",
  title, 
  type, 
  game_asset_key, 
  intro_url,
  video_url
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- Update Module 4 to match the working pattern of other game modules
UPDATE public.modules
SET 
  type = 'game',                -- Must be 'game' type like modules 1, 2, 3
  game_asset_key = 'module4',   -- This is what HybridModule looks for
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
  video_url = NULL,             -- Game modules don't use video_url
  quiz_json = '[
    {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
    {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND (title ILIKE '%module 4%' OR title ILIKE '%hazard%' OR "order" = 5);

-- Verify the fix worked - should match pattern of working modules
SELECT 
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

-- Show the working pattern for comparison
SELECT 
  'Working modules should all have:' as note,
  'type = game' as type_requirement,
  'game_asset_key = module1/module2/module3/module4' as asset_key_requirement,
  'intro_url = video file' as intro_requirement,
  'video_url = NULL' as video_requirement; 