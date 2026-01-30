# Enterprise Training Platform - Database Setup Context

## 🎯 OBJECTIVE
Set up missing database schema and relationships for enterprise training platform features.

## 📊 CURRENT STATE ANALYSIS

### ✅ WORKING:
- 6 test users created with correct authentication
- Enterprise pages load and are accessible 
- Role-based routing functional
- UI components render properly

### ❌ MISSING:
- Organizations table (causing "No Organizations Found")
- User-organization relationships (causing loading states)
- Enterprise enrollment data (causing empty analytics)

## 🧪 TEST RESULTS

**Logged in as:** `enterprise-owner@flatearthequipment.com` / `TestPass123!`

| Page | URL | Current Behavior |
|------|-----|------------------|
| Dashboard | `/enterprise/dashboard` | "No Organizations Found" message |
| Analytics | `/enterprise/analytics` | "No Analytics Data Available" message |
| Team | `/enterprise/team` | Stuck in loading state (6 skeleton cards) |
| Bulk Ops | `/enterprise/bulk` | Completely empty |

## 🔧 DATABASE SCHEMA NEEDED

### 1. Organizations Table
```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'facility',
  settings JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. User-Organizations Junction Table
```sql
CREATE TABLE user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);
```

### 3. Update Enrollments Table
```sql
-- Add org_id column if missing
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS org_id TEXT REFERENCES organizations(id);
```

## 📋 TEST DATA REQUIRED

### Test Organization
```sql
INSERT INTO organizations VALUES (
  'test-enterprise-001',
  'Test Enterprise Inc',
  'facility',
  '{"plan": "enterprise", "max_users": 100, "features": ["analytics", "bulk_ops", "rbac"]}',
  '{"email": "enterprise-owner@flatearthequipment.com", "phone": "555-TEST-001"}'
);
```

### Enterprise Test Users
**All use password:** `TestPass123!`

| Email | Role | Expected Access |
|-------|------|-----------------|
| `enterprise-owner@flatearthequipment.com` | owner | Full system access |
| `enterprise-admin@flatearthequipment.com` | admin | User management |
| `enterprise-manager@flatearthequipment.com` | manager | Team oversight |
| `enterprise-member@flatearthequipment.com` | member | Standard user |
| `enterprise-viewer@flatearthequipment.com` | viewer | Read-only |
| `single-user@flatearthequipment.com` | member | **NO enterprise features** |

### User-Organization Links
```sql
-- Link enterprise users to test organization
INSERT INTO user_organizations (user_id, org_id, role)
SELECT 
  au.id as user_id,
  'test-enterprise-001' as org_id,
  p.role
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE p.email LIKE 'enterprise-%@flatearthequipment.com';
```

### Sample Enrollment Data
```sql
-- Update existing enrollments to include org_id for analytics
UPDATE enrollments 
SET org_id = 'test-enterprise-001'
WHERE user_id IN (
  SELECT p.id FROM profiles p 
  WHERE p.email LIKE 'enterprise-%@flatearthequipment.com'
);
```

## 🎯 EXPECTED OUTCOMES

### After SQL Setup:
1. **Dashboard** → Shows "Test Enterprise Inc" organization with KPIs
2. **Analytics** → Charts and data populate with enrollment metrics  
3. **Team** → Lists 5 enterprise users with role badges
4. **Bulk Ops** → Shows import/export functionality

### Role-Based Access:
- **Owner/Admin** → Full enterprise feature access
- **Manager** → Limited team management
- **Member** → Basic enterprise view
- **Viewer** → Read-only access
- **Single-user** → NO enterprise features (critical regression test)

## 📁 PROJECT STRUCTURE

```
/root/fee-website/
├── .env.local (contains Supabase credentials)
├── lib/supabase/ (client configurations)
├── app/enterprise/ (enterprise page routes)
└── supabase/ (migrations if needed)
```

## 🔗 SUPABASE CONNECTION

**Database:** `https://mzsozezflbhebykncbmr.supabase.co`
**Service Role Key:** Available in `.env.local` file
**Tables to modify:** `organizations`, `user_organizations`, `enrollments`, `profiles`

## ⚠️ CRITICAL REQUIREMENTS

1. **Don't break existing functionality** - single users must continue working normally
2. **Use ON CONFLICT** clauses to avoid duplicate data errors
3. **Test with different roles** after setup
4. **Verify regression** - single-user@flatearthequipment.com should see NO enterprise features

## 🧪 VALIDATION STEPS

1. Login as enterprise-owner → Should see organization dashboard
2. Navigate to each enterprise page → Should show data instead of empty states  
3. Login as different roles → Should see appropriate access levels
4. **CRITICAL:** Login as single-user → Should NOT see any enterprise features

## 🎯 SUCCESS CRITERIA

- [ ] Dashboard shows "Test Enterprise Inc" 
- [ ] Analytics displays charts with sample data
- [ ] Team page lists 5 users with roles
- [ ] Bulk operations shows functionality
- [ ] Role-based permissions work correctly
- [ ] Single-user regression test passes