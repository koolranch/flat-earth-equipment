# Seed Data for Testing

This folder contains SQL scripts to seed placeholder data for QA, designers, and SEO testing.

## Prerequisites

1. Ensure the Phase 1 migration (`20250523_operatorsafety.sql`) has been run
2. Ensure storage buckets exist: `videos`, `certs`, `marketing`
3. Have your Stripe keys in `.env.local`

## Seeding Process

### Step 1: Create the stub course
```sql
-- Run in Supabase SQL Editor
-- File: 20250524_stub_course.sql
```
This creates a basic forklift course with placeholder Stripe IDs.

### Step 2: Add modules with quizzes
```sql
-- Run in Supabase SQL Editor
-- File: 20250524_stub_modules.sql
```
This adds 3 modules with placeholder video URLs and quiz questions.

### Step 3: Update with real Stripe IDs
```bash
npm run seed:stripe
# or
node scripts/seedStripeCourse.ts
```
This creates a real Stripe product/price and updates the course.

### Step 4: Create test enrollment (optional)
```sql
-- Run in Supabase SQL Editor
-- File: 20250524_test_enrollment.sql
```
This creates a test enrollment. You'll need to:
1. Create a user in Supabase Auth dashboard
2. Update the SQL with that user's ID
3. Run the enrollment insert

## Testing the Setup

1. **Landing Page**: Visit `/safety` to see the course
2. **Checkout**: Click "Enroll Now" to test Stripe checkout
3. **Dashboard**: Login as test user and visit `/dashboard`
4. **Quiz Flow**: Complete modules and take quizzes
5. **Certificate**: Complete all modules to get a certificate

## Placeholder Assets

- **Videos**: Using fake Mux URLs (`placeholder-video-1.m3u8`, etc.)
- **Quiz Data**: Embedded in module records as JSON
- **Stripe**: Real product/price created by seed script

## Notes

- The test enrollment requires a real Supabase Auth user
- Videos won't actually play (they're placeholders)
- Certificates will generate with real QR codes
- All data is safe to delete/recreate as needed 