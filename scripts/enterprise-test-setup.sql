-- ============================================
-- ENTERPRISE TEST ENVIRONMENT SETUP
-- ============================================
-- 
-- INSTRUCTIONS FOR VA:
-- 1. First, create accounts by signing up at https://www.flatearthequipment.com
--    using these emails (all go to your catchall inbox):
--    - enterprise-owner@flatearthequipment.com
--    - enterprise-admin@flatearthequipment.com
--    - enterprise-manager@flatearthequipment.com
--    - enterprise-member@flatearthequipment.com
--    - enterprise-viewer@flatearthequipment.com
--    - single-user@flatearthequipment.com (for regression testing)
--
-- 2. Confirm each email via the catchall inbox
--
-- 3. Run this SQL script in Supabase SQL Editor
--    (Dashboard → SQL Editor → New Query → Paste & Run)
--
-- ============================================

-- Step 1: Create the test organization
-- ============================================
INSERT INTO organizations (id, name, type, settings, contact_info, created_at, updated_at)
VALUES (
  'test-enterprise-001',
  'Test Enterprise Inc',
  'facility',
  '{"plan": "enterprise", "max_users": 100, "features": ["analytics", "bulk_ops", "rbac"]}',
  '{"email": "enterprise-owner@flatearthequipment.com", "phone": "555-TEST-001"}',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Step 2: Update profiles with full names for test users
-- ============================================
UPDATE profiles SET full_name = 'Test Owner', role = 'owner'
WHERE email = 'enterprise-owner@flatearthequipment.com';

UPDATE profiles SET full_name = 'Test Admin', role = 'admin'
WHERE email = 'enterprise-admin@flatearthequipment.com';

UPDATE profiles SET full_name = 'Test Manager', role = 'manager'
WHERE email = 'enterprise-manager@flatearthequipment.com';

UPDATE profiles SET full_name = 'Test Member', role = 'member'
WHERE email = 'enterprise-member@flatearthequipment.com';

UPDATE profiles SET full_name = 'Test Viewer', role = 'viewer'
WHERE email = 'enterprise-viewer@flatearthequipment.com';

UPDATE profiles SET full_name = 'Single Purchase User', role = 'member'
WHERE email = 'single-user@flatearthequipment.com';

-- Step 3: Assign org memberships with roles
-- ============================================
-- Note: user_organizations table may not exist yet - these will create org context via enrollments

-- Step 4: Create test enrollments with org context
-- ============================================
-- Get the forklift course ID (or first available course)
DO $$
DECLARE
  v_course_id UUID;
  v_owner_id UUID;
  v_admin_id UUID;
  v_manager_id UUID;
  v_member_id UUID;
  v_viewer_id UUID;
BEGIN
  -- Get course ID
  SELECT id INTO v_course_id FROM courses LIMIT 1;
  
  -- Get user IDs
  SELECT id INTO v_owner_id FROM profiles WHERE email = 'enterprise-owner@flatearthequipment.com';
  SELECT id INTO v_admin_id FROM profiles WHERE email = 'enterprise-admin@flatearthequipment.com';
  SELECT id INTO v_manager_id FROM profiles WHERE email = 'enterprise-manager@flatearthequipment.com';
  SELECT id INTO v_member_id FROM profiles WHERE email = 'enterprise-member@flatearthequipment.com';
  SELECT id INTO v_viewer_id FROM profiles WHERE email = 'enterprise-viewer@flatearthequipment.com';
  
  -- Only proceed if we have all the users
  IF v_course_id IS NOT NULL AND v_owner_id IS NOT NULL THEN
    
    -- Owner: Completed training
    INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, score, created_at)
    VALUES (v_owner_id, v_course_id, 'test-enterprise-001', 100, true, 95, NOW() - INTERVAL '30 days')
    ON CONFLICT DO NOTHING;
    
    -- Admin: Completed training
    IF v_admin_id IS NOT NULL THEN
      INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, score, created_at)
      VALUES (v_admin_id, v_course_id, 'test-enterprise-001', 100, true, 88, NOW() - INTERVAL '25 days')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Manager: In progress
    IF v_manager_id IS NOT NULL THEN
      INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, created_at)
      VALUES (v_manager_id, v_course_id, 'test-enterprise-001', 60, false, NOW() - INTERVAL '10 days')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Member: Just started
    IF v_member_id IS NOT NULL THEN
      INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, created_at)
      VALUES (v_member_id, v_course_id, 'test-enterprise-001', 25, false, NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Viewer: Not started (just enrolled)
    IF v_viewer_id IS NOT NULL THEN
      INSERT INTO enrollments (user_id, course_id, org_id, progress_pct, passed, created_at)
      VALUES (v_viewer_id, v_course_id, 'test-enterprise-001', 0, false, NOW() - INTERVAL '2 days')
      ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Test enrollments created successfully';
  ELSE
    RAISE NOTICE 'Missing course or users - please ensure accounts are created first';
  END IF;
END $$;

-- Step 5: Verify setup
-- ============================================
SELECT 
  p.email,
  p.full_name,
  p.role,
  e.org_id,
  e.progress_pct,
  e.passed
FROM profiles p
LEFT JOIN enrollments e ON p.id = e.user_id
WHERE p.email LIKE '%@flatearthequipment.com'
  AND p.email LIKE 'enterprise-%' OR p.email = 'single-user@flatearthequipment.com'
ORDER BY 
  CASE p.role 
    WHEN 'owner' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
    WHEN 'member' THEN 4 
    WHEN 'viewer' THEN 5 
    ELSE 6 
  END;

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
-- email                                    | full_name           | role    | org_id              | progress | passed
-- enterprise-owner@flatearthequipment.com  | Test Owner          | owner   | test-enterprise-001 | 100      | true
-- enterprise-admin@flatearthequipment.com  | Test Admin          | admin   | test-enterprise-001 | 100      | true
-- enterprise-manager@flatearthequipment.com| Test Manager        | manager | test-enterprise-001 | 60       | false
-- enterprise-member@flatearthequipment.com | Test Member         | member  | test-enterprise-001 | 25       | false
-- enterprise-viewer@flatearthequipment.com | Test Viewer         | viewer  | test-enterprise-001 | 0        | false
-- single-user@flatearthequipment.com       | Single Purchase User| member  | NULL                | NULL     | NULL
