-- File: supabase/seed/test_enrollment_manual.sql

-- Step 1: First, find your user ID by email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'flatearthequip@gmail.com';

-- Copy the ID from above and replace 'YOUR_AUTH_UID' in the queries below

-- Step 2: Create the enrollment (replace YOUR_AUTH_UID with the ID from step 1)
INSERT INTO public.enrollments (
  user_id, 
  course_id, 
  order_id,
  progress_pct,
  passed,
  cert_url,
  expires_at
)
SELECT 
  'YOUR_AUTH_UID'::uuid,  -- Replace with ID from step 1
  c.id,
  gen_random_uuid(),
  0,
  false,
  NULL,
  NULL
FROM public.courses c
WHERE c.slug = 'forklift'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Step 3: Create a test order record for completeness
INSERT INTO public.orders (
  id,
  user_id,
  stripe_payment_intent,
  stripe_customer,
  stripe_receipt_url,
  amount_cents,
  status,
  metadata
)
SELECT
  gen_random_uuid(),
  'YOUR_AUTH_UID'::uuid,  -- Replace with ID from step 1
  'pi_test_manual_' || substr(md5(random()::text), 1, 16),
  'cus_test_manual_' || substr(md5(random()::text), 1, 10),
  'https://pay.stripe.com/receipts/test_manual',
  5900,
  'succeeded',
  jsonb_build_object(
    'course_slug', 'forklift',
    'test_enrollment', true,
    'created_manually', true,
    'user_email', 'flatearthequip@gmail.com'
  )
WHERE EXISTS (
  SELECT 1 FROM public.courses WHERE slug = 'forklift'
)
ON CONFLICT DO NOTHING;

-- Step 4: Verify the enrollment was created
SELECT 
  e.*,
  c.title as course_title,
  u.email as user_email
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
JOIN auth.users u ON u.id = e.user_id
WHERE u.email = 'flatearthequip@gmail.com';

-- Optional: If no user exists with that email, you need to create one first
-- You can do this through Supabase Auth dashboard or use this query:
/*
-- Only run this if the user doesn't exist yet
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'flatearthequip@gmail.com',
  crypt('TempPassword123!', gen_salt('bf')),
  now(),
  '{"full_name": "Test User"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
*/ 