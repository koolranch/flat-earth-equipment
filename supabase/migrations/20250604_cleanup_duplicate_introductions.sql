-- Clean up duplicate Introduction modules and fix module structure
-- This handles cases where the migration was run multiple times

-- Step 1: Delete any duplicate modules (keep only the first occurrence of each order)
DELETE FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND id NOT IN (
    SELECT MIN(id) 
    FROM public.modules 
    WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
    GROUP BY "order"
  );

-- Step 2: Ensure we have the correct Introduction module at order 1
UPDATE public.modules
SET title = 'Introduction',
    video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4',
    type = 'video',
    intro_url = NULL,
    quiz_json = '[
        {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
        {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 1;

-- Step 3: Ensure Module 1 (order 2) is correctly configured as a game
UPDATE public.modules
SET title = 'Module 1',
    type = 'game',
    intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
    video_url = NULL,
    quiz_json = '[
        {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1},
        {"q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2; 