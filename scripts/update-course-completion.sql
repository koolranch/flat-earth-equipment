-- Update Course Completion module to support guide content with video gating
-- Run this in Supabase Dashboard > SQL Editor

-- Check current Course Completion configuration
SELECT 
    'BEFORE UPDATE:' as status,
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
  AND "order" = 7;

-- Update Course Completion to be a game module with guide content
UPDATE public.modules
SET 
    type = 'game',                -- Change to 'game' type to enable guide content
    intro_url = video_url,        -- Move video URL to intro_url for proper gating
    video_url = NULL,             -- Game modules don't use video_url
    game_asset_key = NULL         -- No mini-game, just guide + video + quiz
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 7;

-- Verify the update worked
SELECT 
    'AFTER UPDATE:' as status,
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
  AND "order" = 7;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ COURSE COMPLETION MODULE UPDATED!';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Course Completion now has:';
    RAISE NOTICE '   - type = "game" (enables guide content and video gating)';
    RAISE NOTICE '   - intro_url set to outro.mp4 for proper video display';
    RAISE NOTICE '   - Guide content will load from 6-course-completion.mdx';
    RAISE NOTICE '   - 90-second OSHA compliance timer for certification content';
    RAISE NOTICE '   - Professional completion experience matching other modules';
    RAISE NOTICE '';
    RAISE NOTICE 'Course Completion flow:';
    RAISE NOTICE '1. Guide: Certification requirements and next steps';
    RAISE NOTICE '2. Video: Congratulatory outro video (after 90-second reading)';
    RAISE NOTICE '3. Quiz: Final assessment and course completion';
    RAISE NOTICE '';
END $$; 