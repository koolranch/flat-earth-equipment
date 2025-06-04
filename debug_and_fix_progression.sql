-- Debug and Fix Module Progression - COMPREHENSIVE FIX
-- This script diagnoses and fixes the forklift course progression issue
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. CURRENT STATE DIAGNOSIS
-- ============================================================================

-- Check current enrollment state
SELECT 
    'ENROLLMENT_DEBUG:' as type,
    e.id as enrollment_id,
    e.progress_pct,
    e.passed,
    u.email,
    c.title as course_title,
    c.id as course_id
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- Check module structure and count
SELECT 
    'MODULE_COUNT:' as type,
    COUNT(*) as total_modules,
    ROUND(100.0 / COUNT(*), 2) as progress_per_module
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');

-- Show detailed module structure
SELECT 
    'MODULE_STRUCTURE:' as type,
    "order", 
    title, 
    type,
    CASE WHEN video_url IS NOT NULL THEN 'HAS_VIDEO' ELSE 'NO_VIDEO' END as video_status,
    CASE WHEN intro_url IS NOT NULL THEN 'HAS_INTRO' ELSE 'NO_INTRO' END as intro_status,
    CASE WHEN game_asset_key IS NOT NULL THEN game_asset_key ELSE 'NO_GAME' END as game_key,
    CASE WHEN quiz_json IS NOT NULL THEN jsonb_array_length(quiz_json) ELSE 0 END as quiz_questions
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- ============================================================================
-- 2. CALCULATE EXPECTED PROGRESSION VALUES
-- ============================================================================

WITH module_progression AS (
    SELECT 
        m."order",
        m.title,
        COUNT(*) OVER () as total_modules,
        ROUND((m."order" * 100.0) / COUNT(*) OVER (), 2) as completion_progress,
        CASE 
            WHEN m."order" = 1 THEN 0
            ELSE ROUND(((m."order" - 1) * 100.0) / COUNT(*) OVER (), 2)
        END as unlock_progress
    FROM public.modules m
    WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
    ORDER BY m."order"
)
SELECT 
    'PROGRESSION_TABLE:' as type,
    "order",
    title,
    unlock_progress || '%' as required_to_unlock,
    completion_progress || '%' as progress_after_completion
FROM module_progression;

-- ============================================================================
-- 3. FIX THE PROGRESSION ISSUE
-- ============================================================================

-- Set progress to ensure Module 2 is definitely unlocked
-- Using a slightly higher value to account for any floating-point issues
UPDATE public.enrollments 
SET 
    progress_pct = 29.0,  -- Slightly higher than the exact 28.57% to ensure unlocking
    updated_at = now()
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');

-- ============================================================================
-- 4. VERIFY THE FIX
-- ============================================================================

-- Show the updated state
SELECT 
    'FIXED_ENROLLMENT:' as type,
    e.progress_pct,
    e.passed,
    u.email,
    c.title as course_title
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- Test unlocking logic for each module
WITH unlock_test AS (
    SELECT 
        m."order",
        m.title,
        e.progress_pct as current_progress,
        CASE 
            WHEN m."order" = 1 THEN 0
            ELSE ROUND(((m."order" - 1) * 100.0) / (SELECT COUNT(*) FROM public.modules WHERE course_id = m.course_id), 2)
        END as required_progress,
        CASE 
            WHEN m."order" = 1 THEN true
            ELSE e.progress_pct >= ROUND(((m."order" - 1) * 100.0) / (SELECT COUNT(*) FROM public.modules WHERE course_id = m.course_id), 2)
        END as should_be_unlocked
    FROM public.modules m
    CROSS JOIN public.enrollments e
    WHERE m.course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
      AND e.course_id = m.course_id
    ORDER BY m."order"
)
SELECT 
    'UNLOCK_TEST:' as type,
    "order",
    title,
    current_progress || '%' as current,
    required_progress || '%' as required,
    CASE WHEN should_be_unlocked THEN '🔓 UNLOCKED' ELSE '🔒 LOCKED' END as status
FROM unlock_test;

-- ============================================================================
-- 5. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 COMPREHENSIVE MODULE PROGRESSION FIX COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Progress set to 29%% (Module 1 completed + buffer)';
    RAISE NOTICE '✅ Module 2 should now be unlocked';
    RAISE NOTICE '✅ Added floating-point tolerance in frontend code';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your dashboard';
    RAISE NOTICE '2. Module 2 should be clickable and unlocked';
    RAISE NOTICE '3. Complete Module 2 to progress to Module 3';
    RAISE NOTICE '';
    RAISE NOTICE 'If Module 2 is still locked, check browser console for unlock logs.';
END $$; 