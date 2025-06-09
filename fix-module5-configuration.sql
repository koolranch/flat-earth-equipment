-- Fix Module 5: Ensure proper configuration for the Bozeman Shutdown mini-game
-- Run this in Supabase Dashboard > SQL Editor

-- First, check current Module 5 configuration
SELECT 
    'CURRENT_MODULE_5:' as status,
    id, 
    "order",
    title, 
    type, 
    game_asset_key, 
    intro_url,
    CASE WHEN video_url IS NULL THEN 'NULL' ELSE 'HAS_VALUE' END as video_url_status,
    CASE WHEN quiz_json IS NOT NULL THEN jsonb_array_length(quiz_json) ELSE 0 END as quiz_questions
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND ("order" = 6 OR title ILIKE '%module 5%' OR title ILIKE '%advanced%' OR title ILIKE '%shutdown%')
ORDER BY "order";

-- Update Module 5 to be a proper game module
UPDATE public.modules
SET 
    title = 'Module 5: Advanced Operations',
    type = 'game',                -- Must be 'game' for the mini-game to load
    video_url = NULL,             -- Game modules don't use video_url
    intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefive.mp4',
    game_asset_key = 'module5',   -- This is what HybridModule.tsx looks for
    quiz_json = '[
        {
            "q": "The proper shutdown sequence begins with:",
            "choices": ["Forks down", "Shift to neutral", "Turn key off", "Set parking brake"],
            "answer": 1
        },
        {
            "q": "When parking on a slight ramp you must:",
            "choices": [
                "Leave truck in gear",
                "Chock at least one wheel",
                "Rely on the service brake",
                "Leave forks raised"
            ],
            "answer": 1
        },
        {
            "q": "For battery-electric forklifts, you should wear ______ when plugging in the charger.",
            "choices": ["Leather gloves", "Rubber insulating gloves", "No gloves", "Welding gauntlets"],
            "answer": 1
        },
        {
            "q": "True / False — Forks may remain raised if the area is fenced and no pedestrians enter.",
            "choices": ["True", "False"],
            "answer": 1
        }
    ]'::jsonb
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND ("order" = 6 OR title ILIKE '%module 5%' OR title ILIKE '%advanced%');

-- Verify the fix worked
SELECT 
    'UPDATED_MODULE_5:' as status,
    id, 
    "order",
    title, 
    type, 
    game_asset_key, 
    intro_url,
    CASE WHEN video_url IS NULL THEN 'NULL' ELSE 'HAS_VALUE' END as video_url_status,
    CASE WHEN quiz_json IS NOT NULL THEN jsonb_array_length(quiz_json) ELSE 0 END as quiz_questions
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND game_asset_key = 'module5'
ORDER BY "order";

-- Show all modules for verification
SELECT 
    'ALL_MODULES:' as status,
    "order", 
    title, 
    type, 
    game_asset_key,
    CASE WHEN intro_url IS NOT NULL THEN 'HAS_INTRO' ELSE 'NO_INTRO' END as intro_status
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 MODULE 5 CONFIGURATION FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Module 5 is now configured as a game module';
    RAISE NOTICE '✅ Game asset key set to "module5"';
    RAISE NOTICE '✅ Type set to "game"';
    RAISE NOTICE '✅ Intro video configured';
    RAISE NOTICE '✅ Quiz questions added';
    RAISE NOTICE '';
    RAISE NOTICE 'The Bozeman Shutdown mini-game should now load properly!';
    RAISE NOTICE 'Refresh your dashboard to test Module 5.';
END $$; 