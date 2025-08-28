-- Verification script for quiz_attempts and resume_state migration
-- This script can be run to verify the migration was applied correctly

-- Check if quiz_attempts table exists with correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quiz_attempts'
ORDER BY ordinal_position;

-- Check if enrollments.resume_state column exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'enrollments'
  AND column_name = 'resume_state';

-- Check RLS policies on quiz_attempts
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'quiz_attempts';

-- Check if set_resume function exists
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'set_resume';

-- Check indexes on quiz_attempts
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'quiz_attempts';
