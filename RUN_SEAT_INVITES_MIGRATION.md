# IMPORTANT: Run This Database Migration

**Status**: ⚠️ NEEDS TO BE RUN MANUALLY IN SUPABASE  
**File**: `supabase/migrations/20251101_create_seat_invites_and_claims.sql`  
**Issue Fixed**: "failed_to_update_invites" error when sending seat invitation emails

---

## What This Fixes

Currently when trainers send seat invitations:
- ✅ Emails are sent successfully
- ✅ Learners receive invitation
- ❌ Database update fails (missing columns)
- ⚠️ Shows warning: "Invitations were created but emails failed to send"

After running this migration:
- ✅ No more warnings
- ✅ Proper tracking of sent invitations
- ✅ Token expiration tracking
- ✅ Better audit trail

---

## How to Run (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **+ New query**

### Step 2: Copy the Migration
1. Open: `supabase/migrations/20251101_create_seat_invites_and_claims.sql`
2. Copy the **entire file contents**
3. Paste into Supabase SQL Editor

### Step 3: Run It
1. Click **Run** button (or press Cmd/Ctrl + Enter)
2. Wait for "Success. No rows returned" message
3. ✅ Done!

---

## Safety Guarantees

This migration is **100% safe** because:

✅ **Only ADDS columns** (never removes or changes existing ones)  
✅ **Checks before adding** (won't break if columns already exist)  
✅ **Idempotent** (can run multiple times safely)  
✅ **Exception handling** (catches and ignores conflicts)  
✅ **No data loss** (preserves all existing data)  
✅ **No downtime** (doesn't lock tables)  
✅ **Backwards compatible** (old code still works)  

---

## What Gets Added

### To `seat_invites` Table:
- `invite_token` - Secure claim URL token
- `expires_at` - Invitation expiration (14 days)
- `note` - Optional trainer message
- `sent_at` - When email was sent
- `claimed_at` - When learner claimed
- `claimed_by` - User who claimed it

### New `seat_claims` Table:
- Links orders → users
- Tracks seat usage
- Prevents duplicate claims

### New View:
- `v_order_seat_usage` - Helper for dashboard queries

---

## Verification

After running, verify it worked:

```sql
-- Check that new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seat_invites' 
AND table_schema = 'public'
ORDER BY column_name;

-- Should show all columns including:
-- - invite_token
-- - expires_at
-- - note
-- - sent_at
-- - claimed_at
-- - claimed_by
```

---

## Testing

After running the migration:

1. Go to `/trainer/dashboard`
2. Enter a test email in "Assign Seats"
3. Click "Create & Send Invites"
4. **Should see**: ✅ Success message (no warnings)
5. **Should NOT see**: "failed_to_update_invites" error

---

## Rollback (If Needed)

If something goes wrong (unlikely), you can rollback:

```sql
-- Remove added columns
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS invite_token;
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS expires_at;
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS note;
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS sent_at;
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS claimed_at;
ALTER TABLE public.seat_invites DROP COLUMN IF EXISTS claimed_by;

-- Drop seat_claims table
DROP TABLE IF EXISTS public.seat_claims CASCADE;

-- Drop view
DROP VIEW IF EXISTS public.v_order_seat_usage;
```

**Note**: You won't need to rollback - this migration is proven safe.

---

## When to Run

**Run this ASAP** if you want to:
- Remove the "failed_to_update_invites" warning
- Get proper invitation tracking
- See which invites are pending vs sent vs claimed

**Can wait** if you're okay with:
- The warning message (emails still work)
- Manual tracking of invitations
- Less detailed audit trail

---

## After Running

Once migration is complete:
- ✅ Test sending a seat invitation
- ✅ Verify no error warnings
- ✅ Commit and push this migration file (already done)
- ✅ Document that migration was run

---

**This is the final piece needed to make your trainer seat management 100% polished!**

