-- Step 1: Shift all existing modules up by 1 order (Module 1 becomes Module 2, etc.)
UPDATE public.modules 
SET "order" = "order" + 1
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');

-- Step 2: Create new Introduction module (order = 1)
INSERT INTO public.modules (
    course_id, 
    "order", 
    title, 
    video_url, 
    type,
    quiz_json
) VALUES (
    (SELECT id FROM public.courses WHERE slug = 'forklift'),
    1,
    'Introduction',
    'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4',
    'video',
    '[
        {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
        {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
    ]'::json
);

-- Step 3: Update the old Module 1 (now Module 2) to use the correct moduleone.mp4 video
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
    intro_url = NULL  -- Remove intro_url since it's now in the Introduction module
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2;  -- This is the old Module 1 