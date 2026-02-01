-- FIX: Update enrollments to use the correct org_id from org_members
-- This fixes the Analytics page showing "No Data"

-- Step 1: See what org_ids exist in org_members for enterprise users
SELECT 
  p.email,
  om.org_id as org_members_org_id,
  e.org_id as enrollment_org_id,
  e.id as enrollment_id
FROM profiles p
JOIN org_members om ON p.id = om.user_id
LEFT JOIN enrollments e ON p.id = e.user_id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com';

-- Step 2: Update enrollments to use the org_id from org_members
UPDATE enrollments e
SET org_id = om.org_id
FROM org_members om
WHERE e.user_id = om.user_id
  AND (e.org_id IS NULL OR e.org_id::text != om.org_id::text);

-- Step 3: For users without enrollments, create them
-- First, get a course to use
DO $$
DECLARE
  v_course_id UUID;
  v_org_id UUID;
  v_user RECORD;
BEGIN
  -- Get first available course
  SELECT id INTO v_course_id FROM courses LIMIT 1;
  
  IF v_course_id IS NULL THEN
    RAISE NOTICE 'No courses found - cannot create enrollments';
    RETURN;
  END IF;

  -- Loop through enterprise users who don't have enrollments
  FOR v_user IN 
    SELECT p.id as user_id, om.org_id, p.email
    FROM profiles p
    JOIN org_members om ON p.id = om.user_id
    WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
      AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = p.id)
  LOOP
    INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, created_at)
    VALUES (
      v_user.user_id,
      v_course_id,
      v_user.org_id,
      CASE 
        WHEN v_user.email LIKE '%owner%' THEN 100
        WHEN v_user.email LIKE '%admin%' THEN 100
        WHEN v_user.email LIKE '%manager%' THEN 75
        ELSE 30
      END,
      v_user.email LIKE '%owner%' OR v_user.email LIKE '%admin%',
      NOW() - INTERVAL '14 days'
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created enrollment for %', v_user.email;
  END LOOP;
END $$;

-- Step 4: Verify the fix
SELECT 
  'Verification' as check_type,
  p.email,
  om.org_id as org_members_org_id,
  e.org_id as enrollment_org_id,
  e.progress_pct,
  e.passed,
  CASE WHEN om.org_id = e.org_id THEN '✓ MATCH' ELSE '✗ MISMATCH' END as status
FROM profiles p
JOIN org_members om ON p.id = om.user_id
LEFT JOIN enrollments e ON p.id = e.user_id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ORDER BY p.email;

-- Step 5: Count enrollments with org_id matching your org
SELECT 
  org_id,
  COUNT(*) as enrollment_count,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END) as completed_count,
  ROUND(AVG(progress_pct)::numeric, 1) as avg_progress
FROM enrollments
WHERE org_id IN (SELECT DISTINCT org_id FROM org_members)
GROUP BY org_id;
