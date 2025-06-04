-- Fix Module 1: Pre-Operation Inspection to have all required components
-- Run this in Supabase Dashboard > SQL Editor

-- First, ensure the game_asset_key column exists
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS game_asset_key TEXT;

-- Fix Module 1 (order = 2 after Introduction module)
UPDATE public.modules
SET 
    title = 'Module 1: Pre-Operation Inspection',
    type = 'game',
    video_url = NULL,  -- Game modules don't use video_url
    intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
    game_asset_key = 'module1',  -- Required for the game component
    quiz_json = '[
        {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["High-visibility vest", "Noise-cancelling earbuds", "Hard-hat", "Steel-toe boots"], "answer": 1},
        {"q": "Forks should travel:", "choices": ["Touching the floor", "4–6 inches above the floor", "At axle height", "At eye level"], "answer": 1},
        {"q": "During routine travel, what is the *primary* purpose of the service brake on a forklift?", "choices": ["Slowing and stopping the truck under normal conditions", "Holding the truck stationary when parked", "Sounding an alarm", "Tilting the mast backward"], "answer": 0},
        {"q": "True / False — You may drive a forklift without a hi-vis vest as long as you remain in marked aisles.", "choices": ["True", "False"], "answer": 1}
    ]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2;

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