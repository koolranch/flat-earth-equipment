-- Test SQL to verify smart login redirect will work correctly
-- Run this in Supabase SQL Editor to check your org_members data

-- 1. Check existing org_members and their roles
SELECT 
  om.id,
  om.user_id,
  au.email,
  om.role as current_role,
  CASE 
    WHEN om.role IN ('owner', 'trainer', 'admin', 'manager') THEN '/enterprise/dashboard'
    WHEN om.role IN ('learner', 'member', 'viewer') THEN '/enterprise/dashboard'
    ELSE '/training'
  END as expected_redirect,
  o.name as org_name
FROM org_members om
LEFT JOIN auth.users au ON au.id = om.user_id
LEFT JOIN orgs o ON o.id = om.org_id
ORDER BY om.created_at DESC;

-- 2. Check for users WITHOUT org membership (should go to /training)
SELECT 
  au.id,
  au.email,
  au.created_at,
  '/training' as expected_redirect,
  'No org membership' as reason
FROM auth.users au
LEFT JOIN org_members om ON om.user_id = au.id
WHERE om.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 3. Verify role constraint allows new RBAC roles
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.org_members'::regclass
  AND conname LIKE '%role%';

-- 4. Test role normalization mapping
SELECT 
  unnest(ARRAY['owner', 'trainer', 'learner', 'admin', 'manager', 'member', 'viewer']) as db_role,
  CASE unnest(ARRAY['owner', 'trainer', 'learner', 'admin', 'manager', 'member', 'viewer'])
    WHEN 'owner' THEN 'owner'
    WHEN 'trainer' THEN 'manager'
    WHEN 'learner' THEN 'member'
    WHEN 'admin' THEN 'admin'
    WHEN 'manager' THEN 'manager'
    WHEN 'member' THEN 'member'
    WHEN 'viewer' THEN 'viewer'
  END as normalized_rbac_role,
  CASE unnest(ARRAY['owner', 'trainer', 'learner', 'admin', 'manager', 'member', 'viewer'])
    WHEN 'owner' THEN 'Level 5 - Full Control'
    WHEN 'admin' THEN 'Level 4 - User Management'
    WHEN 'trainer' THEN 'Level 3 - Team Management (legacy)'
    WHEN 'manager' THEN 'Level 3 - Team Management'
    WHEN 'member' THEN 'Level 2 - Personal Access'
    WHEN 'learner' THEN 'Level 2 - Personal Access (legacy)'
    WHEN 'viewer' THEN 'Level 1 - Read Only'
  END as permission_level;

-- 5. Identify test accounts for login testing
SELECT 
  au.email,
  om.role,
  o.name as org_name,
  CASE 
    WHEN om.role IN ('owner', 'admin', 'trainer', 'manager') THEN '✅ Should see enterprise dashboard on login'
    WHEN om.role IN ('learner', 'member', 'viewer') THEN '✅ Should see enterprise dashboard (limited view)'
    WHEN om.role IS NULL THEN '✅ Should see /training (single-purchase flow)'
    ELSE '⚠️ Unknown behavior'
  END as expected_behavior
FROM auth.users au
LEFT JOIN org_members om ON om.user_id = au.id
LEFT JOIN orgs o ON o.id = om.org_id
WHERE au.email LIKE '%enterprise%' OR au.email LIKE '%test%'
ORDER BY om.role NULLS LAST;
