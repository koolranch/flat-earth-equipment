-- Clean up duplicate Introduction modules and fix module structure (UUID-safe version)
-- This handles cases where the migration was run multiple times

-- Step 1: Delete duplicate modules (keep only the first occurrence of each order)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "order" ORDER BY created_at ASC) as rn
  FROM public.modules 
  WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
)
DELETE FROM public.modules 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Ensure we have the correct Introduction module at order 1
UPDATE public.modules
SET title = 'Introduction',
    video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4',
    type = 'video',
    intro_url = NULL,
    quiz_json = '[
        {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
        {"q": "Who should complete forklift training?", "choices": ["Only supervisors", "Anyone who operates a forklift", "Only new employees", "Only maintenance staff"], "answer": 1}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 1;

-- Step 3: Ensure Module 1 (now at order 2) has correct configuration
UPDATE public.modules
SET title = 'Module 1: Pre-Operation Inspection',
    type = 'game',
    video_url = NULL,
    intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
    quiz_json = '[
        {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1},
        {"q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2; 