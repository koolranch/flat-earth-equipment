-- Test enrollment for flatearthequip@gmail.com
-- User ID: 3ee07adb-4a22-444b-8484-c4d747560824

-- Create enrollment if it doesn't exist
INSERT INTO public.enrollments (user_id, course_id, progress_pct, passed)
SELECT 
  '3ee07adb-4a22-444b-8484-c4d747560824'::uuid,
  id,
  0,
  false
FROM public.courses
WHERE slug = 'forklift'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Verify the enrollment
SELECT 
  e.*,
  c.title as course_title
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
WHERE e.user_id = '3ee07adb-4a22-444b-8484-c4d747560824'::uuid; 