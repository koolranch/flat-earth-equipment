-- ============================================
-- COMPLETE ENTERPRISE SETUP WITH USER-ORG RELATIONSHIPS
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'facility',
  settings JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_organizations junction table (THE MISSING PIECE)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- 3. Insert test organization
INSERT INTO organizations (id, name, type, settings, contact_info)
VALUES (
  'test-enterprise-001',
  'Test Enterprise Inc',
  'facility',
  '{"plan": "enterprise", "max_users": 100, "features": ["analytics", "bulk_ops", "rbac"]}',
  '{"email": "enterprise-owner@flatearthequipment.com", "phone": "555-TEST-001"}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  contact_info = EXCLUDED.contact_info,
  updated_at = NOW();

-- 4. CRITICAL: Link enterprise users to the organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  au.id as user_id,
  'test-enterprise-001' as org_id,
  p.role
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role = EXCLUDED.role;

-- 5. CRITICAL: Create enrollments with org_id for dashboard visibility
-- The dashboard reads from enrollments.org_id, not the organizations table directly
DO $$
DECLARE
  v_course_id UUID;
BEGIN
  -- Get first available course
  SELECT id INTO v_course_id FROM courses LIMIT 1;
  
  IF v_course_id IS NOT NULL THEN
    -- Create enrollments for enterprise users with org context
    INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, score, created_at)
    SELECT 
      au.id,
      v_course_id,
      'test-enterprise-001',
      CASE p.role 
        WHEN 'owner' THEN 100 
        WHEN 'admin' THEN 100 
        WHEN 'manager' THEN 60 
        WHEN 'member' THEN 25 
        WHEN 'viewer' THEN 0 
      END,
      CASE WHEN p.role IN ('owner', 'admin') THEN true ELSE false END,
      CASE WHEN p.role IN ('owner', 'admin') THEN 90 ELSE NULL END,
      NOW() - INTERVAL '30 days'
    FROM auth.users au
    JOIN profiles p ON au.id = p.id
    WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created enrollments with org_id for enterprise users';
  ELSE
    RAISE NOTICE 'No courses found - skipping enrollment creation';
  END IF;
END $$;

-- 7. Verify the complete setup
SELECT 
  'Setup Check' as check_type,
  'Organizations' as table_name, 
  COUNT(*) as count 
FROM organizations
WHERE id = 'test-enterprise-001'

UNION ALL

SELECT 
  'Setup Check',
  'User-Org Links',
  COUNT(*) 
FROM user_organizations 
WHERE org_id = 'test-enterprise-001'

UNION ALL

SELECT 
  'Setup Check',
  'Enterprise Users',
  COUNT(*) 
FROM profiles 
WHERE email LIKE 'enterprise-%@flatearthequipment.com'

UNION ALL

SELECT 
  'Setup Check',
  'Enrollments with org_id',
  COUNT(*) 
FROM enrollments 
WHERE org_id = 'test-enterprise-001';

-- 8. Show the user-organization mapping with enrollment status
SELECT 
  p.email,
  p.role as profile_role,
  uo.role as org_role,
  o.name as organization_name,
  e.progress_pct,
  e.passed
FROM profiles p
JOIN auth.users au ON p.id = au.id  
LEFT JOIN user_organizations uo ON au.id = uo.user_id
LEFT JOIN organizations o ON uo.org_id = o.id
LEFT JOIN enrollments e ON au.id = e.user_id AND e.org_id = 'test-enterprise-001'
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ORDER BY 
  CASE p.role 
    WHEN 'owner' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
    WHEN 'member' THEN 4 
    WHEN 'viewer' THEN 5 
  END;

-- ============================================
-- EXPECTED VERIFICATION OUTPUT:
-- ============================================
-- check_type   | table_name              | count
-- -------------|-------------------------|-------
-- Setup Check  | Organizations           | 1
-- Setup Check  | User-Org Links          | 5
-- Setup Check  | Enterprise Users        | 5
-- Setup Check  | Enrollments with org_id | 5
--
-- If all counts show expected values, the enterprise dashboard
-- should now display "Test Enterprise Inc" with user data.