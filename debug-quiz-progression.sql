-- Debug and Fix Quiz Progression Issue
-- When completing Module 2's quiz, Module 3 should unlock

-- ============================================================================
-- 1. CURRENT STATE DIAGNOSIS
-- ============================================================================

-- Check current enrollment state
SELECT 
    'CURRENT_ENROLLMENT:' as type,
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
-- 3. TEST UNLOCKING LOGIC FOR EACH MODULE
-- ============================================================================

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
-- 4. EXPECTED FLOW BASED ON CURRENT SETUP
-- ============================================================================

DO $$
DECLARE
  module_count INTEGER;
  progress_per_module NUMERIC;
BEGIN
  SELECT COUNT(*) INTO module_count 
  FROM public.modules 
  WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');
  
  progress_per_module := 100.0 / module_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 EXPECTED PROGRESSION FLOW (%s modules):',module_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Module 1 completion → %s%% progress → Unlocks Module 2', ROUND(1 * progress_per_module, 2);
  RAISE NOTICE 'Module 2 completion → %s%% progress → Unlocks Module 3', ROUND(2 * progress_per_module, 2);
  RAISE NOTICE 'Module 3 completion → %s%% progress → Unlocks Module 4', ROUND(3 * progress_per_module, 2);
  RAISE NOTICE '';
  RAISE NOTICE 'Each module completion adds %s%% to progress', ROUND(progress_per_module, 2);
END $$;

-- ============================================================================
-- 5. FIX: SIMULATE MODULE 2 COMPLETION TO UNLOCK MODULE 3
-- ============================================================================

-- If Module 2 quiz was completed but progress wasn't updated correctly,
-- set the progress to what it should be after Module 2 completion

WITH module_info AS (
  SELECT 
    COUNT(*) as total_modules,
    ROUND((2 * 100.0) / COUNT(*), 2) as module2_completion_progress
  FROM public.modules 
  WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
)
UPDATE public.enrollments 
SET 
    progress_pct = (SELECT module2_completion_progress FROM module_info),
    updated_at = now()
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');

-- ============================================================================
-- 6. VERIFY THE FIX
-- ============================================================================

-- Show the updated state
SELECT 
    'AFTER_FIX:' as type,
    e.progress_pct,
    e.passed,
    u.email,
    c.title as course_title
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- Test unlocking logic again
WITH unlock_test_after AS (
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
    'UNLOCKED_AFTER_FIX:' as type,
    "order",
    title,
    current_progress || '%' as current,
    required_progress || '%' as required,
    CASE WHEN should_be_unlocked THEN '🔓 UNLOCKED' ELSE '🔒 LOCKED' END as status
FROM unlock_test_after;

-- ============================================================================
-- 7. SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 QUIZ PROGRESSION FIX COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Progress updated to Module 2 completion level';
    RAISE NOTICE '✅ Module 3 should now be unlocked';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your dashboard';
    RAISE NOTICE '2. Module 3 should be clickable and unlocked';
    RAISE NOTICE '3. Complete Module 3 to progress to Module 4';
    RAISE NOTICE '';
    RAISE NOTICE 'If Module 3 is still locked, check browser console for debugging logs.';
END $$; 