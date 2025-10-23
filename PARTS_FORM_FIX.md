# Parts Request Form Fix

## 🐛 Problem Identified

The parts request form on brand serial lookup pages (e.g., `/brand/takeuchi/serial-lookup`) was not working because the **`parts_leads` database table doesn't exist**.

When users submitted the form, the API tried to insert into a non-existent table, causing silent failures.

## ✅ Solution Created

I've created:
1. **Database migration** - `supabase/migrations/20251023000000_create_parts_leads_table.sql`
2. **Helper script** - `scripts/apply-parts-leads-migration.ts`

## 🚀 How to Fix (Choose One Method)

### Method A: Run the Helper Script (Recommended)

```bash
# Make sure .env.local has your Supabase credentials
tsx scripts/apply-parts-leads-migration.ts
```

This will:
- Create the `parts_leads` table
- Add proper indexes
- Set up Row Level Security policies
- Verify the table was created successfully

### Method B: Apply Manually via Supabase Dashboard

If the script fails, apply the migration manually:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of:
   `supabase/migrations/20251023000000_create_parts_leads_table.sql`
6. Click **Run** (or press Cmd+Enter)
7. Verify you see: ✅ Success. No rows returned

### Method C: Use Supabase CLI (If Installed)

```bash
npx supabase db push
```

This will apply all pending migrations in the `supabase/migrations/` folder.

## 📋 What the Table Stores

The `parts_leads` table captures:
- **Brand & Equipment:** brand_slug, equipment_type, model, serial_number
- **Contact Info:** contact_email (required), contact_name, contact_phone, company_name
- **Parts Request:** part_description (required), notes, fault_code
- **Status Tracking:** status (new/contacted/quoted/closed/lost), urgency
- **Analytics:** utm_source, utm_medium, utm_campaign, user_agent, ip_address

## 🔒 Security

- **Row Level Security (RLS)** enabled
- **Public INSERT policy** - Anyone can submit form
- **Service role access** - Admin/API can read all records
- **Email validation** - Enforced at database level

## 🧪 Testing After Migration

1. **Test the form:**
   - Go to: https://flatearthequipment.com/brand/takeuchi/serial-lookup
   - Scroll to "Request Takeuchi Parts"
   - Fill out the form (use real email)
   - Submit

2. **Check for success:**
   - You should see: ✅ "Thanks! We'll email you shortly..."
   - Check your email for confirmation
   - Check Supabase Dashboard → Table Editor → `parts_leads` for the record

3. **Verify email notifications:**
   - Check that LEADS_TO_EMAIL receives notification
   - Check customer receives acknowledgment email

## 📊 View Submitted Leads

**Via Supabase Dashboard:**
1. Go to: Table Editor → `parts_leads`
2. View all submissions sorted by `created_at DESC`

**Via SQL:**
```sql
SELECT 
  created_at,
  brand_slug,
  model,
  contact_email,
  contact_name,
  part_description,
  status
FROM parts_leads
ORDER BY created_at DESC
LIMIT 20;
```

## 🔔 Email Configuration

The form sends two emails (if SendGrid is configured):

1. **To Admin** (`LEADS_TO_EMAIL`)
   - Subject: "Parts Lead — {brand} {model} / {serial}"
   - Contains all form details

2. **To Customer** (auto-reply)
   - Subject: "We received your parts request ({brand})"
   - Confirmation message

**Required environment variables:**
- `SENDGRID_API_KEY` - Your SendGrid API key
- `LEADS_TO_EMAIL` - Where to send lead notifications
- `LEADS_FROM_EMAIL` - Reply-to address (optional, defaults to noreply@flatearthequipment.com)

## 🎯 Affected Pages

This fix resolves the form on **all** brand serial lookup pages:
- `/brand/bobcat/serial-lookup`
- `/brand/toyota/serial-lookup`
- `/brand/yale/serial-lookup`
- `/brand/crown/serial-lookup`
- `/brand/hyster/serial-lookup`
- `/brand/raymond/serial-lookup`
- `/brand/takeuchi/serial-lookup`
- ...and ~30 more brand pages

## ✅ Next Steps

1. **Run the migration** (choose method above)
2. **Test the form** on any brand serial lookup page
3. **Monitor submissions** in Supabase dashboard
4. **Set up email alerts** if not already configured

Once the migration is applied, the form will start working immediately—no code changes needed!

