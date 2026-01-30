# Cursor Agent - Enterprise Setup Checklist

## 🎯 TASK SUMMARY
Fix enterprise training platform by setting up missing database schema and relationships.

## 📁 FILES PROVIDED
- `CURSOR_CONTEXT.md` - Complete background and requirements
- `complete_enterprise_setup.sql` - Full SQL setup script  
- `verify_enterprise_setup.mjs` - Verification script

## ⚡ QUICK EXECUTION PLAN

### Step 1: Review Current State
- Enterprise pages load but show empty states
- 6 test users exist but lack organization relationships
- Missing: organizations table, user_organizations table

### Step 2: Run SQL Setup
**Method A: Direct Supabase**
1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `complete_enterprise_setup.sql`
3. Execute the SQL script

**Method B: Via Node.js** 
1. Update verification script to include SQL execution
2. Run: `node complete_setup_and_verify.mjs`

### Step 3: Verify Setup
```bash
cd /root/fee-website
node verify_enterprise_setup.mjs
```

Expected output:
- ✅ Organization: "Test Enterprise Inc"  
- ✅ 5 user-org relationships
- ✅ 5 enterprise users
- ✅ Single user with NO org membership

### Step 4: Test in Browser
1. Login: `enterprise-owner@flatearthequipment.com` / `TestPass123!`
2. Navigate: `/enterprise/dashboard`
3. Should see organization data instead of "No Organizations Found"
4. Test other enterprise pages for data population

### Step 5: Critical Regression Test
1. Login: `single-user@flatearthequipment.com` / `TestPass123!`  
2. Should NOT see any enterprise features
3. Should see normal training interface

## 🚨 CRITICAL SUCCESS CRITERIA

- [ ] Dashboard shows "Test Enterprise Inc"
- [ ] Analytics shows data charts  
- [ ] Team page shows 5 users with roles
- [ ] Bulk operations page has functionality
- [ ] **Single-user sees NO enterprise features**

## 💡 TROUBLESHOOTING

**If SQL fails:**
- Check table constraints and foreign key references
- Use `IF NOT EXISTS` and `ON CONFLICT` clauses  
- Verify auth.users table structure

**If no data appears:**
- Check user_organizations relationships exist
- Verify profiles have correct email patterns
- Check org_id linkage in enrollments table

## 🔧 ENVIRONMENT DETAILS

**Supabase URL:** `https://mzsozezflbhebykncbmr.supabase.co`
**Credentials:** Available in `/root/fee-website/.env.local`
**Test Site:** `https://www.flatearthequipment.com`

## 📋 POST-SETUP VALIDATION

Run this command to verify everything works:
```bash
node verify_enterprise_setup.mjs
```

Should output:
- Organizations: 1
- User-Org Links: 5
- Enterprise Users: 5
- Single user confirmed isolated

## ⚠️ SAFETY NOTES

- Don't modify existing user accounts  
- Don't break single-user functionality
- Use ON CONFLICT to avoid duplicate errors
- Test thoroughly before declaring success