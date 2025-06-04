-- Fix Module 2: Set up with moduletwo.mp4 video and 8-Point Inspection game
-- Run this in Supabase Dashboard > SQL Editor

-- First ensure all required columns exist
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS game_asset_key TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS intro_url TEXT;

-- Update Module 2 (order = 3, after Introduction and Module 1)
UPDATE public.modules
SET 
    title = 'Module 2: Pre-Operation Inspection',
    type = 'game',
    video_url = NULL,  -- Game modules don't use video_url
    intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduletwo.mp4',
    game_asset_key = 'module2',  -- Required for the 8-Point Inspection game
    quiz_json = '[
        {"q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1},
        {"q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1},
        {"q": "How often should pre-operation inspections be performed?", "choices": ["Weekly", "Monthly", "Before each shift", "Only when problems occur"], "answer": 2},
        {"q": "Which is NOT typically part of a forklift inspection?", "choices": ["Checking tire condition", "Testing the horn", "Inspecting hydraulic fluid", "Cleaning the windshield"], "answer": 3}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 3;  -- Module 2 is at order 3 (after Introduction=1, Module 1=2)

-- Verify the update worked
SELECT 
    "order", 
    title, 
    type, 
    intro_url, 
    game_asset_key,
    quiz_json
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order"; 