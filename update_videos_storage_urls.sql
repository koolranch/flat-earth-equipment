-- Update Video Storage URLs to use the new uploads in the 'videos' bucket
-- Run this in Supabase Dashboard > SQL Editor

-- Update Module 4: Load Handling & Safety to use modulefour.mp4
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 5  -- Module 4 is at order 5
  AND title LIKE '%Module 4%';

-- Update Course Completion to use outro.mp4
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/outro.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 7  -- Course Completion is at order 7
  AND title LIKE '%Completion%';

-- Optional: Update all existing videos to use the new videos bucket if you have uploaded all files there
-- Uncomment these lines if you want to switch all videos to the new bucket:

/*
-- Update Introduction video
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/intro.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 1;

-- Update Module 1 intro video
UPDATE public.modules
SET intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduleone.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2;

-- Update Module 2 intro video
UPDATE public.modules
SET intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduletwo.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 3;

-- Update Module 3 video
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 4;

-- Update Module 5 video
UPDATE public.modules
SET video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefive.mp4'
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 6;
*/

-- Verify the updates worked
SELECT 
    "order", 
    title, 
    video_url
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order"; 