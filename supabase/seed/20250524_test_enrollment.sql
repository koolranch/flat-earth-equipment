-- File: supabase/seed/20250524_test_enrollment.sql

-- Create a test user and enrollment for QA/designers
DO $$
DECLARE
  test_user_id UUID;
  course_id_var UUID;
  order_id_var UUID;
BEGIN
  -- Create a test user (or get existing)
  test_user_id := gen_random_uuid();
  
  -- Note: This creates a user in auth.users table
  -- In production, users are created through Supabase Auth
  -- For testing, you may want to create via Supabase dashboard instead
  
  -- Get the forklift course
  SELECT id INTO course_id_var FROM public.courses WHERE slug = 'forklift' LIMIT 1;
  
  IF course_id_var IS NOT NULL THEN
    -- Create a test order
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
    VALUES (
      gen_random_uuid(),
      test_user_id,
      'pi_test_' || substr(md5(random()::text), 1, 24),
      'cus_test_' || substr(md5(random()::text), 1, 14),
      'https://pay.stripe.com/receipts/test_receipt',
      5900,
      'succeeded',
      jsonb_build_object(
        'course_slug', 'forklift',
        'user_email', 'test@example.com',
        'test_enrollment', true
      )
    )
    RETURNING id INTO order_id_var;
    
    -- Create enrollment
    INSERT INTO public.enrollments (
      user_id,
      course_id,
      order_id,
      progress_pct,
      passed,
      cert_url,
      expires_at
    )
    VALUES (
      test_user_id,
      course_id_var,
      order_id_var,
      0, -- Start at 0% progress
      false,
      NULL,
      NULL
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test enrollment created successfully!';
    RAISE NOTICE 'Test user ID: %', test_user_id;
    RAISE NOTICE 'To test the dashboard, create a user with this ID in Supabase Auth dashboard';
  ELSE
    RAISE NOTICE 'Course not found. Please run stub_course.sql and stub_modules.sql first.';
  END IF;
END $$;

-- Alternative: Create enrollment for an existing user
-- Replace 'your-user-id-here' with an actual user ID from auth.users
/*
INSERT INTO public.enrollments (
  user_id,
  course_id,
  order_id,
  progress_pct,
  passed
)
SELECT 
  'your-user-id-here'::uuid,
  c.id,
  gen_random_uuid(),
  0,
  false
FROM public.courses c
WHERE c.slug = 'forklift'
ON CONFLICT DO NOTHING;
*/ 