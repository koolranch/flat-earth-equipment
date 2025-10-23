# 🚨 IMMEDIATE ACTION REQUIRED: Fix Parts Request Form

## Problem Found

The parts request form on your brand serial lookup pages (Takeuchi, Toyota, Yale, etc.) **is not working** because the `parts_leads` database table doesn't exist.

Every form submission is **failing silently**—you're losing leads!

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard**

### Step 2: Navigate to SQL Editor

1. Click on your **Flat Earth Equipment** project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 3: Run the Migration

Copy the **entire contents** of this file:
```
supabase/migrations/20251023000000_create_parts_leads_table.sql
```

Paste it into the SQL Editor and click **Run** (or press Cmd+Enter).

You should see: ✅ **Success. No rows returned**

### Step 4: Verify It Worked

1. Go to: **Table Editor** in Supabase Dashboard
2. You should now see a table called **`parts_leads`**
3. It will have columns: id, created_at, brand_slug, contact_email, etc.

## 🧪 Test the Form

1. Visit: https://flatearthequipment.com/brand/takeuchi/serial-lookup
2. Scroll to **"Request Takeuchi Parts"** form
3. Fill out:
   - Email: your-email@example.com
   - What parts do you need: "test submission"
4. Click **Request Parts Help**
5. You should see: ✅ "Thanks! We'll email you shortly..."

## 📊 View Submissions

**After the migration, you can view leads at:**

Supabase Dashboard → Table Editor → `parts_leads`

**Or run this SQL:**
```sql
SELECT 
  created_at,
  brand_slug,
  model,
  contact_email,
  part_description,
  status
FROM parts_leads
ORDER BY created_at DESC;
```

## 🎯 What This Fixes

Once the migration is applied, the form will work on **all 30+ brand pages:**
- `/brand/bobcat/serial-lookup`
- `/brand/toyota/serial-lookup`
- `/brand/yale/serial-lookup`
- `/brand/crown/serial-lookup`
- `/brand/hyster/serial-lookup`
- `/brand/takeuchi/serial-lookup`
- ...and all others

## 📧 Email Notifications (Optional)

The form can send email notifications if you have SendGrid configured:

**Environment variables needed:**
- `SENDGRID_API_KEY` - Your SendGrid API key
- `LEADS_TO_EMAIL` - Where to receive lead notifications (e.g., sales@flatearthequipment.com)
- `LEADS_FROM_EMAIL` - From address (defaults to noreply@flatearthequipment.com)

If these aren't set, the form will still work—leads will be saved to the database, but you won't get email notifications.

## ⏰ How Long Has This Been Broken?

The form has likely been broken **since the brand pages were created**, as the table was never created in the initial setup.

**You may have lost leads** from users trying to request parts!

## 🔔 Recommendation

After fixing:
1. **Monitor the table daily** for new submissions
2. **Set up email notifications** so you're alerted immediately
3. **Add a Zapier/Make.com integration** to auto-create tickets in your CRM

---

**⚡ Apply the migration NOW to start capturing parts leads!**

See `PARTS_FORM_FIX.md` for additional details and troubleshooting.

