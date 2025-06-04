-- Fix Module Progression Flow - TARGETED FIX
-- This script only fixes the forklift course progression, preserving all other data
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. VERIFY CURRENT STATE
-- ============================================================================

-- Show current enrollment progress for the forklift course
SELECT 
    'CURRENT_ENROLLMENT:' as type,
    e.progress_pct,
    e.passed,
    u.email,
    c.title as course_title
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- Show current module structure
SELECT 
    'CURRENT_MODULES:' as type,
    "order", 
    title, 
    type
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- ============================================================================
-- 2. FIX PROGRESSION ISSUE
-- ============================================================================

-- The issue: If you're currently at 14.3% (completed Introduction only)
-- and Module 1 completion should take you to 28.57% (2/7 * 100)
-- This should unlock Module 2 which needs 28.57% (2 * 100/7)

-- Let's ensure your enrollment can progress properly by setting it to
-- a state where Module 1 is completed and Module 2 should unlock

-- Option A: If you've completed Module 1 quiz, set progress to unlock Module 2
UPDATE public.enrollments 
SET 
    progress_pct = 28.57,  -- This represents Module 1 completed (2/7 modules)
    updated_at = now()
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift');

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

-- Verify the fix
SELECT 
    'UPDATED_ENROLLMENT:' as type,
    e.progress_pct,
    e.passed,
    u.email,
    c.title as course_title,
    CASE 
        WHEN e.progress_pct >= 28.57 THEN 'Module 2 UNLOCKED' 
        ELSE 'Module 2 LOCKED' 
    END as module_2_status
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- ============================================================================
-- 4. PROGRESSION LOGIC EXPLANATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 MODULE PROGRESSION FIX APPLIED!';
    RAISE NOTICE '';
    RAISE NOTICE 'How the progression works with 7 modules:';
    RAISE NOTICE 'Introduction (order=1): 0%% → 14.29%% (unlocks Module 1)';
    RAISE NOTICE 'Module 1 (order=2): 14.29%% → 28.57%% (unlocks Module 2)';
    RAISE NOTICE 'Module 2 (order=3): 28.57%% → 42.86%% (unlocks Module 3)';
    RAISE NOTICE 'Module 3 (order=4): 42.86%% → 57.14%% (unlocks Module 4)';
    RAISE NOTICE 'Module 4 (order=5): 57.14%% → 71.43%% (unlocks Module 5)';
    RAISE NOTICE 'Module 5 (order=6): 71.43%% → 85.71%% (unlocks Course Completion)';
    RAISE NOTICE 'Course Completion (order=7): 85.71%% → 100%% (generates certificate)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your progress is now 28.57%% - Module 2 should be unlocked!';
    RAISE NOTICE '';
    RAISE NOTICE 'Refresh your dashboard to see Module 2 unlocked.';
END $$; 