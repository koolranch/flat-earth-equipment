-- Fix Module 1 to show moduleone.mp4 video before the game
-- Module 1 is type='game' so it uses HybridModule which needs intro_url (not video_url)

UPDATE public.modules
SET intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
    video_url = NULL  -- Clear video_url since game modules use intro_url
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
  AND "order" = 2  -- This is Module 1 (after Introduction)
  AND type = 'game';  -- Make sure we're targeting the game module 