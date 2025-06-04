-- Complete Database Fix for Flat Earth Equipment Learning Platform
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================================
-- 1. CREATE BASIC SCHEMA (if not exists)
-- ============================================================================

-- Enable crypto for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- COURSES table
CREATE TABLE IF NOT EXISTS public.courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  description   text,
  price_cents   integer NOT NULL,
  stripe_price  text UNIQUE,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- MODULES table  
CREATE TABLE IF NOT EXISTS public.modules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  "order"       integer,
  title         text NOT NULL,
  video_url     text,
  intro_url     text,
  type          text DEFAULT 'video',
  game_asset_key text,
  quiz_json     jsonb,
  created_at    timestamptz DEFAULT now()
);

-- ORDERS table
CREATE TABLE IF NOT EXISTS public.orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users(id),
  course_id          uuid REFERENCES public.courses(id),
  stripe_session_id  text UNIQUE,
  seats              integer DEFAULT 1,
  amount_cents       integer,
  created_at         timestamptz DEFAULT now()
);

-- ENROLLMENTS table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id),
  course_id     uuid REFERENCES public.courses(id),
  progress_pct  real DEFAULT 0,
  passed        boolean DEFAULT false,
  cert_url      text,
  expires_at    timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. SET UP ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Courses policy (public read)
DROP POLICY IF EXISTS "courses_read" ON public.courses;
CREATE POLICY "courses_read" ON public.courses FOR SELECT USING (true);

-- Modules policy (enrolled users can read)
DROP POLICY IF EXISTS "module_read_enrolled" ON public.modules;
CREATE POLICY "module_read_enrolled" ON public.modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid() 
    AND e.course_id = modules.course_id
  )
);

-- Orders policy (owner only)
DROP POLICY IF EXISTS "orders_owner" ON public.orders;
CREATE POLICY "orders_owner" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- Enrollments policy (owner only)
DROP POLICY IF EXISTS "enroll_owner" ON public.enrollments;
CREATE POLICY "enroll_owner" ON public.enrollments FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 3. CLEAN UP AND CREATE FORKLIFT COURSE
-- ============================================================================

-- Delete existing data for forklift course
DELETE FROM public.modules WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 'forklift');
DELETE FROM public.courses WHERE slug = 'forklift';

-- Create the forklift course
INSERT INTO public.courses (slug, title, description, price_cents, stripe_price)
VALUES (
  'forklift',
  'Online Forklift Operator Certification',
  'Complete OSHA-compliant forklift safety training with interactive demos and assessment',
  5900,
  'price_1RSHWVHJI548rO8Jf9CJer6y'
);

-- ============================================================================
-- 4. CREATE CORRECT MODULE STRUCTURE
-- ============================================================================

-- Get the course ID
WITH forklift_course AS (
  SELECT id FROM public.courses WHERE slug = 'forklift'
)

-- Insert the 5 modules with correct configuration
INSERT INTO public.modules (course_id, "order", title, type, video_url, intro_url, game_asset_key, quiz_json)
SELECT 
  fc.id,
  module_data.order_num,
  module_data.title,
  module_data.type,
  module_data.video_url,
  module_data.intro_url,
  module_data.game_asset_key,
  module_data.quiz_json::jsonb
FROM forklift_course fc,
(VALUES 
  (1, 'Introduction', 'video', 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4', null, null, '[
    {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
    {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
  ]'),
  
  (2, 'Module 1: Pre-Operation Inspection', 'game', null, 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4', 'module1', '[
    {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1},
    {"q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1}
  ]'),
  
  (3, 'Module 2: 8-Point Inspection', 'game', null, 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduletwo.mp4', 'module2', '[
    {"q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1},
    {"q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1},
    {"q": "How often should pre-operation inspections be performed?", "choices": ["Weekly", "Monthly", "Before each shift", "Only when problems occur"], "answer": 2},
    {"q": "Which is NOT typically part of a forklift inspection?", "choices": ["Checking tire condition", "Testing the horn", "Inspecting hydraulic fluid", "Cleaning the windshield"], "answer": 3}
  ]'),
  
  (4, 'Module 3: Operating Procedures', 'video', 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8', null, null, '[
    {"q": "What is the maximum travel speed in work areas?", "choices": ["5 mph", "10 mph", "15 mph"], "answer": 0},
    {"q": "When traveling with a load, the forks should be:", "choices": ["Raised high", "Tilted back and low", "Level with ground"], "answer": 1},
    {"q": "What is the stability triangle?", "choices": ["Three wheels touching ground", "The area between the three support points", "Three-point contact rule"], "answer": 1}
  ]'),
  
  (5, 'Module 4: Workplace Safety', 'video', 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8', null, null, '[
    {"q": "What percentage of forklift accidents involve pedestrians?", "choices": ["10%", "25%", "36%"], "answer": 2},
    {"q": "When should you sound the horn?", "choices": ["At intersections and blind spots", "Only in emergencies", "Every 30 seconds"], "answer": 0},
    {"q": "Safe distance from other forklifts:", "choices": ["3 truck lengths", "1 truck length", "5 feet"], "answer": 0}
  ]')
) AS module_data(order_num, title, type, video_url, intro_url, game_asset_key, quiz_json);

-- ============================================================================
-- 5. SET UP TEST ENROLLMENT WITH CORRECT PROGRESS
-- ============================================================================

-- Create test enrollment (if user exists)
DO $$
DECLARE
  test_user_id uuid;
  course_id_var uuid;
BEGIN
  -- Try to find existing test user
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'flatearthequip@gmail.com' LIMIT 1;
  
  -- Get course ID
  SELECT id INTO course_id_var FROM public.courses WHERE slug = 'forklift';
  
  IF test_user_id IS NOT NULL AND course_id_var IS NOT NULL THEN
    -- Delete existing enrollment
    DELETE FROM public.enrollments WHERE user_id = test_user_id AND course_id = course_id_var;
    
    -- Create new enrollment with 20% progress (completed Introduction, unlocks Module 1)
    INSERT INTO public.enrollments (user_id, course_id, progress_pct, passed, created_at)
    VALUES (test_user_id, course_id_var, 20.0, false, now());
    
    RAISE NOTICE 'Test enrollment created with 20%% progress for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found or course not created';
  END IF;
END $$;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Show course info
SELECT 'COURSE:' as type, slug, title, price_cents FROM public.courses WHERE slug = 'forklift';

-- Show modules structure
SELECT 
  'MODULE:' as type,
  "order", 
  title, 
  type, 
  CASE WHEN video_url IS NOT NULL THEN 'HAS_VIDEO' ELSE 'NO_VIDEO' END as video_status,
  CASE WHEN intro_url IS NOT NULL THEN 'HAS_INTRO' ELSE 'NO_INTRO' END as intro_status,
  game_asset_key
FROM public.modules 
WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'forklift')
ORDER BY "order";

-- Show enrollment status
SELECT 
  'ENROLLMENT:' as type,
  e.progress_pct,
  e.passed,
  u.email,
  c.title as course_title
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id  
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE c.slug = 'forklift';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'Your learning flow is now:';
  RAISE NOTICE '1. Introduction (video + quiz) ✅ COMPLETED (20%% progress)';
  RAISE NOTICE '2. Module 1: Pre-Operation Inspection (moduleone.mp4 + game + quiz) 🔓 UNLOCKED';
  RAISE NOTICE '3. Module 2: 8-Point Inspection (moduletwo.mp4 + game + quiz) 🔒 LOCKED (needs 40%%)';
  RAISE NOTICE '4. Module 3: Operating Procedures (video + quiz) 🔒 LOCKED (needs 60%%)';
  RAISE NOTICE '5. Module 4: Workplace Safety (video + quiz) 🔒 LOCKED (needs 80%%)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Module 2 will have the moduletwo.mp4 video and 8-Point Inspection game';
  RAISE NOTICE '✅ Progress set to 20%% - Module 1 should be unlocked and ready to use';
  RAISE NOTICE '';
  RAISE NOTICE 'Refresh your dashboard to see the changes!';
END $$; 