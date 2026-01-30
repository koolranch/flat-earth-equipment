# Enterprise Training Platform - Testing Guide

## 🚀 TEST ENVIRONMENT READY

### Test Accounts Created ✅
All users have password: `TestPass123!`

| Email | Role | Expected Access |
|-------|------|-----------------|
| `enterprise-owner@flatearthequipment.com` | Owner | Full system access |
| `enterprise-admin@flatearthequipment.com` | Admin | User management, no system settings |
| `enterprise-manager@flatearthequipment.com` | Manager | Team oversight, limited editing |
| `enterprise-member@flatearthequipment.com` | Member | Standard user access |
| `enterprise-viewer@flatearthequipment.com` | Viewer | Read-only access |
| `single-user@flatearthequipment.com` | Member | Non-enterprise user (regression test) |

## 📋 SYSTEMATIC TESTING CHECKLIST

### Phase A: Enterprise Dashboard Testing

**Test URL:** `https://www.flatearthequipment.com/enterprise/dashboard`

#### Owner/Admin Testing:
- [ ] **Login** with enterprise-owner@flatearthequipment.com
- [ ] Dashboard loads without errors
- [ ] Organization name displays: "Test Enterprise Inc"
- [ ] KPI cards show data (users, completion rate, etc.)
- [ ] "Analytics" button visible and clickable
- [ ] "Team" button visible and clickable
- [ ] "Bulk Ops" button visible and clickable
- [ ] User table shows enrolled members
- [ ] Can filter/search users
- [ ] **Logout** and repeat with enterprise-admin@flatearthequipment.com

#### Manager Testing:
- [ ] **Login** with enterprise-manager@flatearthequipment.com
- [ ] Dashboard loads successfully
- [ ] KPIs visible
- [ ] Team/Bulk Ops buttons may show limited view
- [ ] Cannot access system settings

#### Member Testing:
- [ ] **Login** with enterprise-member@flatearthequipment.com
- [ ] Dashboard loads (basic view)
- [ ] Limited functionality compared to admin

#### Viewer Testing:
- [ ] **Login** with enterprise-viewer@flatearthequipment.com
- [ ] Read-only view works
- [ ] No edit actions available

---

### Phase B: Analytics Testing

**Test URL:** `https://www.flatearthequipment.com/enterprise/analytics`

#### All Roles:
- [ ] Page loads successfully
- [ ] 8 KPI cards display
- [ ] Enrollment trends chart renders (area chart)
- [ ] Score trends chart renders (line chart)
- [ ] Department comparison chart renders (bar chart)
- [ ] Recent activity feed shows events

#### Admin+ Only:
- [ ] "Export CSV" button visible
- [ ] CSV download works
- [ ] Refresh button functions

---

### Phase C: Team Management Testing

**Test URL:** `https://www.flatearthequipment.com/enterprise/team`

#### Admin Testing:
- [ ] **Login** with enterprise-admin@flatearthequipment.com
- [ ] Member list shows all test users
- [ ] Role badges display correctly (color-coded)
- [ ] Filter by role works
- [ ] Search by name/email works
- [ ] "Manage Role" button opens modal
- [ ] Can change member's role (but not owner's)
- [ ] Permission preview shows in modal

#### Manager Testing:
- [ ] **Login** with enterprise-manager@flatearthequipment.com
- [ ] Can view team list
- [ ] "Manage Role" button NOT visible

#### Member/Viewer Testing:
- [ ] Page redirects or shows "Access Denied"

---

### Phase D: Bulk Operations Testing

**Test URL:** `https://www.flatearthequipment.com/enterprise/bulk`

#### Admin Only:
- [ ] **Login** with enterprise-admin@flatearthequipment.com
- [ ] All three tabs visible (Import Users, Assign Training, Export)
- [ ] "Download Template" downloads CSV
- [ ] File upload shows preview table
- [ ] "Validate" shows validation results
- [ ] Export Users downloads CSV
- [ ] Export Enrollments downloads CSV

#### Manager/Member/Viewer:
- [ ] Shows "Access Denied" message

---

### Phase E: **CRITICAL** - Single-User Regression Testing

**Test URL:** Various training URLs

#### Single-User Testing:
- [ ] **Login** with single-user@flatearthequipment.com
- [ ] `/trainer/dashboard` loads normally
- [ ] `/training/module-1` accessible
- [ ] **NO enterprise UI elements appear**
- [ ] Can progress through training normally
- [ ] Certificate generation works (if completed)

---

## 🚨 KNOWN ISSUES TO VERIFY

### Database Schema Limitations:
1. **Organizations table**: May not exist (new feature)
2. **Score column**: Missing from enrollments table
3. **Enterprise enrollments**: May not have sample data

### Expected Behaviors:
1. **New user invites**: Users must sign up themselves (invite flow planned)
2. **Role changes**: Take effect on next page load/login
3. **Analytics data**: Shows last 30 days only
4. **Bulk import**: Updates existing users only

---

## 🐛 BUG REPORTING

If you find issues, document:

**Role:** [owner/admin/manager/member/viewer]
**Page:** [URL]
**Browser:** [Chrome/Firefox/Safari/etc]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [If applicable]

---

## ✅ SUCCESS CRITERIA

### Must Work:
- [ ] All roles can access their permitted features
- [ ] Role-based permissions are enforced
- [ ] Single-user functionality remains intact
- [ ] No enterprise features leak to single users
- [ ] Basic enterprise dashboard loads for all enterprise roles

### Should Work (if implemented):
- [ ] Analytics charts render with data
- [ ] Team management shows test users
- [ ] CSV export functionality
- [ ] Role change functionality

---

## 🎯 PRIORITY TEST ORDER

1. **Single-user regression** (most critical)
2. **Basic dashboard access** for all enterprise roles
3. **Role-based restrictions** (admin vs viewer)
4. **Analytics functionality**
5. **Team management features**
6. **Bulk operations** (admin only)

---

**Ready to begin testing! Start with single-user regression to ensure existing functionality is not broken.**