-- Comprehensive Module Fix - Addresses all data integrity issues
-- Run this in Supabase Dashboard > SQL Editor

-- First, show current state for debugging
SELECT 
  'BEFORE FIX:' as status,
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

-- Delete any duplicate or corrupted modules to start fresh
-- Keep only modules with the expected structure
DELETE FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND (
    -- Remove modules with incorrect title/game_asset_key combinations
    (title ILIKE '%module 2%' AND game_asset_key != 'module2') OR
    (title ILIKE '%module 3%' AND game_asset_key != 'module3') OR
    (title ILIKE '%module 4%' AND game_asset_key != 'module4') OR
    -- Remove any modules with malformed data
    (type = 'game' AND game_asset_key IS NULL) OR
    -- Remove any obvious duplicates or test entries
    title ILIKE '%test%' OR title ILIKE '%duplicate%'
  );

-- Now fix/update each module with the correct configuration
-- Update Introduction module (order = 1)
UPDATE public.modules
SET 
  title = 'Introduction',
  type = 'video',
  video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/intro.mp4',
  intro_url = NULL,
  game_asset_key = NULL,
  quiz_json = '[
    {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
    {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 1;

-- Update Module 1: Pre-Operation Inspection (order = 2)
UPDATE public.modules
SET 
  title = 'Module 1: Pre-Operation Inspection',
  type = 'game',
  video_url = NULL,
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduleone.mp4',
  game_asset_key = 'module1',
  quiz_json = '[
    {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["High-visibility vest", "Noise-cancelling earbuds", "Hard-hat", "Steel-toe boots"], "answer": 1},
    {"q": "Forks should travel:", "choices": ["Touching the floor", "4–6 inches above the floor", "At axle height", "At eye level"], "answer": 1}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2;

-- Update Module 2: 8-Point Inspection (order = 3)
UPDATE public.modules
SET 
  title = 'Module 2: 8-Point Inspection',
  type = 'game',
  video_url = NULL,
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduletwo.mp4',
  game_asset_key = 'module2',
  quiz_json = '[
    {"q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1},
    {"q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 3;

-- Update Module 3: Balance & Load Handling (order = 4)
UPDATE public.modules
SET 
  title = 'Module 3: Balance & Load Handling',
  type = 'game',
  video_url = NULL,
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4',
  game_asset_key = 'module3',
  quiz_json = '[
    {"q": "What is the key to maintaining forklift stability?", "choices": ["Speed", "Load distribution within stability triangle", "Loud horn", "Bright lights"], "answer": 1},
    {"q": "When carrying a load, the forks should be:", "choices": ["High up", "Tilted back and 4-6 inches off ground", "Tilted forward", "At maximum height"], "answer": 1}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 4;

-- Update Module 4: Hazard Hunt (order = 5) - THE CRITICAL FIX
UPDATE public.modules
SET 
  title = 'Module 4: Hazard Hunt',
  type = 'game',
  video_url = NULL,
  intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
  game_asset_key = 'module4',  -- Ensure this is EXACTLY 'module4' with no extra characters
  quiz_json = '[
    {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
    {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
  ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 5;

-- Clean any potential whitespace or hidden characters from game_asset_key
UPDATE public.modules
SET game_asset_key = TRIM(game_asset_key)
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND game_asset_key IS NOT NULL;

-- Verify the fix worked
SELECT 
  'AFTER FIX:' as status,
  id, 
  "order",
  title, 
  type, 
  game_asset_key,
  LENGTH(game_asset_key) as key_length,  -- Check for length issues
  intro_url,
  CASE WHEN video_url IS NULL THEN 'NULL' ELSE 'HAS_VALUE' END as video_url_status
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- Show character analysis of Module 4's game_asset_key
SELECT 
  'Module 4 Character Analysis:' as analysis,
  game_asset_key,
  LENGTH(game_asset_key) as length,
  ascii(substring(game_asset_key, 1, 1)) as char1_ascii,
  ascii(substring(game_asset_key, 2, 1)) as char2_ascii,
  ascii(substring(game_asset_key, 3, 1)) as char3_ascii,
  ascii(substring(game_asset_key, 4, 1)) as char4_ascii,
  ascii(substring(game_asset_key, 5, 1)) as char5_ascii,
  ascii(substring(game_asset_key, 6, 1)) as char6_ascii,
  ascii(substring(game_asset_key, 7, 1)) as char7_ascii
FROM modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 5; 