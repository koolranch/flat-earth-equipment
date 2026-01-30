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

-- 5. Verify the complete setup
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
WHERE email LIKE 'enterprise-%@flatearthequipment.com';

-- 6. Show the user-organization mapping
SELECT 
  p.email,
  p.role as profile_role,
  uo.role as org_role,
  o.name as organization_name
FROM profiles p
JOIN auth.users au ON p.id = au.id  
JOIN user_organizations uo ON au.id = uo.user_id
JOIN organizations o ON uo.org_id = o.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ORDER BY 
  CASE p.role 
    WHEN 'owner' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
    WHEN 'member' THEN 4 
    WHEN 'viewer' THEN 5 
  END;