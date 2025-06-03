-- Fix Module 1 quiz question: change "NOT optional" to "optional"
-- Module 1 is now at order = 2 (after Introduction module)

UPDATE public.modules
SET quiz_json = '[
    {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1},
    {"q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1}
]'::json
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2  -- This is Module 1 (after Introduction)
  AND title LIKE '%Module%';  -- Extra safety check to make sure we're updating the right module 