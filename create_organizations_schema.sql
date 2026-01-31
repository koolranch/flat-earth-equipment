-- ============================================
-- ENTERPRISE ORGANIZATIONS SCHEMA SETUP
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

-- 2. Create user_organizations junction table
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- 3. Add org_id column to enrollments if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'enrollments' AND column_name = 'org_id') THEN
    ALTER TABLE enrollments ADD COLUMN org_id TEXT REFERENCES organizations(id);
  END IF;
END $$;

-- 4. Insert test organization
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

-- 5. Link enterprise test users to the organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  p.id as user_id,
  'test-enterprise-001' as org_id,
  p.role
FROM profiles p
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role = EXCLUDED.role;

-- 6. Update existing enrollments to include org_id
UPDATE enrollments 
SET org_id = 'test-enterprise-001'
WHERE user_id IN (
  SELECT p.id 
  FROM profiles p 
  WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
)
AND org_id IS NULL;

-- 7. Verify the setup
SELECT 'Organizations' as table_name, count(*) as count FROM organizations
UNION ALL
SELECT 'User-Organization Links', count(*) FROM user_organizations
UNION ALL  
SELECT 'Enterprise Enrollments', count(*) FROM enrollments WHERE org_id = 'test-enterprise-001';