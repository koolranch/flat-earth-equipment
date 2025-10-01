-- Reorganize module orders for cleaner progress tracking
-- Introduction: order 0 (not counted toward completion)
-- Training Modules 1-5: orders 1-5 (counted toward completion)
-- Course Completion: order 99 (not counted toward completion)

-- Step 1: Update Introduction to order 0
UPDATE public.modules
SET "order" = 0
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND title = 'Introduction';

-- Step 2: Shift training modules down by 1 (currently at orders 2-6, need to be 1-5)
UPDATE public.modules
SET "order" = "order" - 1
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" >= 2 
  AND "order" <= 6;

-- Step 3: Update Course Completion to order 99
UPDATE public.modules
SET "order" = 99
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND title LIKE '%Course Completion%';

-- Verify the changes
SELECT "order", title, type FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

