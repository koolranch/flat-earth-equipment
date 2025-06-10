-- Fix Module 5: Configure it as a game module to enable the guide phase
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's see Module 5's current configuration
SELECT 
    'CURRENT_MODULE_5:' as status,
    id, 
    "order",
    title, 
    type, 
    game_asset_key, 
    intro_url,
    video_url,
    CASE WHEN quiz_json IS NOT NULL THEN jsonb_array_length(quiz_json) ELSE 0 END as quiz_questions
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND ("order" = 6 OR title ILIKE '%module 5%' OR title ILIKE '%advanced%')
ORDER BY "order";

-- Update Module 5 to be a game module (this enables the HybridModule with guide phase)
UPDATE public.modules
SET 
    type = 'game',                -- MUST be 'game' to use HybridModule with guide phase
    intro_url = video_url,        -- Move video URL to intro_url for game modules
    video_url = NULL,             -- Game modules don't use video_url
    game_asset_key = 'module5'    -- Required for the mini-game component
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 MODULE 5 GUIDE PHASE FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Module 5 is now type = "game" (enables HybridModule)';
    RAISE NOTICE '✅ Video moved from video_url to intro_url';
    RAISE NOTICE '✅ Game asset key set to "module5"';
    RAISE NOTICE '✅ Module 5 will now show:';
    RAISE NOTICE '    1. Guide phase (15-second reading requirement)';
    RAISE NOTICE '    2. Video phase (after guide is read)';
    RAISE NOTICE '    3. Game phase (MiniShutdown component)';
    RAISE NOTICE '    4. Quiz phase';
    RAISE NOTICE '';
    RAISE NOTICE 'Refresh your dashboard to test Module 5 with the guide phase!';
END $$; 