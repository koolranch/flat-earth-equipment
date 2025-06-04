-- Fix Module 1: Pre-Operation Inspection to have all required components
-- Module 1 is now at order = 2 (after Introduction module at order = 1)

-- Ensure Module 1 has all required fields for the game module
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

-- Verify that we have the game_asset_key column (add if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'game_asset_key') THEN
        ALTER TABLE public.modules ADD COLUMN game_asset_key TEXT;
    END IF;
END $$;

-- Re-run the update to make sure game_asset_key is set
UPDATE public.modules
SET game_asset_key = 'module1'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2
  AND type = 'game'; 