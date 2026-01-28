# Enterprise Training System - Testing Guide

## Overview

This guide helps you test the enterprise training features with different role levels.

---

## Step 1: Create Test Accounts

Sign up at **https://www.flatearthequipment.com** using these emails:

| Email | Purpose |
|-------|---------|
| `enterprise-owner@flatearthequipment.com` | Owner role - full access |
| `enterprise-admin@flatearthequipment.com` | Admin role - user management |
| `enterprise-manager@flatearthequipment.com` | Manager role - team oversight |
| `enterprise-member@flatearthequipment.com` | Member role - standard user |
| `enterprise-viewer@flatearthequipment.com` | Viewer role - read-only |
| `single-user@flatearthequipment.com` | Non-enterprise user (regression test) |

**Confirm each email** via the catchall inbox.

---

## Step 2: Run Setup SQL

1. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy contents from `scripts/enterprise-test-setup.sql`
3. Click **Run**
4. Verify output shows all test users with correct roles

---

## Step 3: Test Each Role

### Browser Setup (for parallel testing)
- **Chrome**: enterprise-owner@
- **Firefox**: enterprise-admin@
- **Safari**: enterprise-manager@
- **Chrome Incognito**: enterprise-member@
- **Edge**: single-user@

---

## Test URLs

| Page | URL |
|------|-----|
| Enterprise Dashboard | https://www.flatearthequipment.com/enterprise/dashboard |
| Analytics | https://www.flatearthequipment.com/enterprise/analytics |
| Team Management | https://www.flatearthequipment.com/enterprise/team |
| Bulk Operations | https://www.flatearthequipment.com/enterprise/bulk |
| Trainer Dashboard | https://www.flatearthequipment.com/trainer/dashboard |
| Training Module | https://www.flatearthequipment.com/training/module-1 |

---

## Role Permission Matrix

| Feature | Owner | Admin | Manager | Member | Viewer |
|---------|:-----:|:-----:|:-------:|:------:|:------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Team Page | ✅ | ✅ | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bulk Import/Export | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Training | ✅ | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Test Checklist

### A. Enterprise Dashboard (`/enterprise/dashboard`)

**As Owner/Admin:**
- [ ] Page loads without errors
- [ ] Organization name displays correctly ("Test Enterprise Inc")
- [ ] KPI cards show data (users, completion rate, etc.)
- [ ] "Analytics" button visible and works
- [ ] "Team" button visible and works
- [ ] "Bulk Ops" button visible and works
- [ ] User table shows enrolled members
- [ ] Can filter/search users

**As Member:**
- [ ] Dashboard loads
- [ ] KPIs visible
- [ ] Team/Bulk Ops buttons may be hidden or show limited view

**As Viewer:**
- [ ] Read-only view works
- [ ] No edit actions available

---

### B. Analytics (`/enterprise/analytics`)

**All Roles:**
- [ ] Page loads
- [ ] 8 KPI cards display
- [ ] Enrollment trends chart renders (area chart)
- [ ] Score trends chart renders (line chart)
- [ ] Department comparison chart renders (bar chart)
- [ ] Recent activity feed shows events

**Admin+ Only:**
- [ ] "Export CSV" button visible and downloads file
- [ ] Refresh button works

---

### C. Team Management (`/enterprise/team`)

**As Admin:**
- [ ] Member list shows all test users
- [ ] Role badges display correctly (color-coded)
- [ ] Filter by role works
- [ ] Search by name/email works
- [ ] "Manage Role" button opens modal
- [ ] Can change member's role (but not owner's)
- [ ] Permission preview shows in modal

**As Manager:**
- [ ] Can view team list
- [ ] "Manage Role" button NOT visible

**As Member/Viewer:**
- [ ] Page may redirect or show "Access Denied"

---

### D. Bulk Operations (`/enterprise/bulk`)

**As Admin:**
- [ ] All three tabs visible (Import Users, Assign Training, Export)
- [ ] "Download Template" downloads CSV
- [ ] File upload shows preview table
- [ ] "Validate" shows validation results
- [ ] Export Users downloads CSV
- [ ] Export Enrollments downloads CSV

**As Manager/Member/Viewer:**
- [ ] Shows "Access Denied" message

---

### E. Single-User Regression (`single-user@`)

**CRITICAL - Must Not Break:**
- [ ] `/trainer/dashboard` loads normally
- [ ] `/training/module-1` accessible
- [ ] No enterprise UI elements appear
- [ ] Can progress through training
- [ ] Certificate generation works (if completed)

---

## Bug Report Template

```markdown
**Role:** [owner/admin/manager/member/viewer]
**Page:** [URL]
**Browser:** [Chrome/Firefox/Safari/etc]
**Device:** [Desktop/Mobile]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:**


**Actual:**


**Screenshot:** [attach if applicable]
```

---

## Known Limitations

1. **New user invites**: Currently, users must sign up themselves. Invite flow is planned.
2. **Role changes**: Take effect on next page load/login.
3. **Analytics data**: Shows last 30 days only.
4. **Bulk import**: Updates existing users only; new users need signup flow.

---

## Contact

Report issues to the development team with:
- Screenshot
- Browser console errors (F12 → Console)
- Network errors (F12 → Network → filter for red)
