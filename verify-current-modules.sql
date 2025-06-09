-- Quick verification of current module structure
-- Run this in Supabase Dashboard > SQL Editor

SELECT 
    'CURRENT_MODULES:' as type,
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

-- Check current enrollment progress
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

-- Calculate progression flow
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
    'PROGRESSION_FLOW:' as type,
    "order",
    title,
    unlock_progress || '%' as required_to_unlock,
    completion_progress || '%' as progress_after_completion
FROM module_progression; 