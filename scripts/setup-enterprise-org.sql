-- ============================================================
-- ENTERPRISE ORGANIZATION SETUP SCRIPT
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- BEFORE RUNNING: Replace the placeholder values below:
--   1. ORG_NAME: The organization's name (e.g., 'Acme Warehousing')
--   2. OWNER_EMAIL: Email of the person who will be the org owner/admin
--   3. TOTAL_SEATS: Number of training seats purchased
-- ============================================================

-- ============================================================
-- STEP 0: First, run the migration for course enrollment support
-- (Only needed once per database, skip if already applied)
-- ============================================================

-- Add course_id to invitations table
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invitations_course_idx 
ON public.invitations(course_id) WHERE course_id IS NOT NULL;

COMMENT ON COLUMN public.invitations.course_id IS 
'Optional: auto-enroll user in this course when they accept the invitation';

-- Update org_members role check to include admin and manager
ALTER TABLE public.org_members 
DROP CONSTRAINT IF EXISTS org_members_role_check;

ALTER TABLE public.org_members 
ADD CONSTRAINT org_members_role_check 
CHECK (role IN ('owner', 'admin', 'manager', 'trainer', 'member', 'learner', 'viewer'));

-- Update the accept_invitation function with course enrollment support
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text)
RETURNS boolean AS $$
DECLARE 
  v_inv record;
BEGIN
  -- Find the pending invitation
  SELECT * INTO v_inv 
  FROM public.invitations 
  WHERE token = p_token 
    AND accepted_at IS NULL 
    AND expires_at > now();
  
  IF NOT FOUND THEN 
    RETURN false; 
  END IF;
  
  -- Add user to organization
  INSERT INTO public.org_members (org_id, user_id, role) 
  VALUES (v_inv.org_id, auth.uid(), v_inv.role)
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = excluded.role;
  
  -- Mark invitation as accepted
  UPDATE public.invitations 
  SET accepted_at = now() 
  WHERE id = v_inv.id;
  
  -- If course_id was specified, create enrollment
  IF v_inv.course_id IS NOT NULL THEN
    INSERT INTO public.enrollments (user_id, course_id, org_id, learner_email, progress_pct, passed)
    SELECT 
      auth.uid(),
      v_inv.course_id,
      v_inv.org_id,
      v_inv.email,
      0,
      false
    WHERE NOT EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE user_id = auth.uid() AND course_id = v_inv.course_id
    );
    
    -- Update org_seats allocation if tracking exists
    UPDATE public.org_seats 
    SET allocated_seats = allocated_seats + 1
    WHERE org_id = v_inv.org_id 
      AND course_id = v_inv.course_id
      AND allocated_seats < total_seats;
  END IF;
  
  -- Audit log
  INSERT INTO public.audit_events(org_id, actor_user_id, action, target, meta)
  VALUES (
    v_inv.org_id, 
    auth.uid(), 
    'invite.accept', 
    v_inv.email, 
    jsonb_build_object(
      'token', '***',
      'course_id', v_inv.course_id
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 1: Get the forklift course ID (for reference)
-- ============================================================
-- Run this first to see your course ID:
SELECT id, title, slug FROM public.courses WHERE slug = 'forklift';


-- ============================================================
-- STEP 2: Create the organization
-- ============================================================
-- REPLACE 'ORG_NAME' and 'OWNER_EMAIL' with actual values

DO $$
DECLARE
  v_owner_id uuid;
  v_org_id uuid;
  v_course_id uuid;
  
  -- ========== CONFIGURE THESE VALUES ==========
  v_org_name text := 'REPLACE_WITH_ORG_NAME';        -- e.g., 'Acme Warehousing'
  v_owner_email text := 'REPLACE_WITH_OWNER_EMAIL';  -- e.g., 'john@acme.com'
  v_total_seats int := 10;                            -- Number of seats purchased
  -- ============================================
  
BEGIN
  -- Get the owner's user ID from their email
  SELECT id INTO v_owner_id 
  FROM auth.users 
  WHERE email = v_owner_email;
  
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. They must create an account first.', v_owner_email;
  END IF;
  
  -- Get the forklift course ID
  SELECT id INTO v_course_id 
  FROM public.courses 
  WHERE slug = 'forklift';
  
  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Forklift course not found. Check courses table.';
  END IF;
  
  -- Create the organization
  INSERT INTO public.orgs (name, created_by)
  VALUES (v_org_name, v_owner_id)
  RETURNING id INTO v_org_id;
  
  RAISE NOTICE 'Created organization: % (ID: %)', v_org_name, v_org_id;
  
  -- Add the owner as an org member with 'owner' role
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org_id, v_owner_id, 'owner');
  
  RAISE NOTICE 'Added % as owner', v_owner_email;
  
  -- Create seat allocation for the forklift course
  INSERT INTO public.org_seats (org_id, course_id, total_seats, allocated_seats)
  VALUES (v_org_id, v_course_id, v_total_seats, 0);
  
  RAISE NOTICE 'Allocated % seats for forklift training', v_total_seats;
  
  -- Output summary
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE 'Organization: %', v_org_name;
  RAISE NOTICE 'Org ID: %', v_org_id;
  RAISE NOTICE 'Owner: %', v_owner_email;
  RAISE NOTICE 'Seats: %', v_total_seats;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Owner signs in at flatearthequipment.com';
  RAISE NOTICE '2. Goes to /enterprise/dashboard';
  RAISE NOTICE '3. Uses "Invite Users" to add team members';
  RAISE NOTICE '========================================';
END $$;


-- ============================================================
-- STEP 3: Verify the setup (run after Step 2)
-- ============================================================

-- Check the org was created
SELECT o.id, o.name, o.created_at, u.email as owner_email
FROM public.orgs o
JOIN auth.users u ON o.created_by = u.id
ORDER BY o.created_at DESC
LIMIT 5;

-- Check org members
SELECT om.org_id, o.name as org_name, om.user_id, u.email, om.role
FROM public.org_members om
JOIN public.orgs o ON om.org_id = o.id
JOIN auth.users u ON om.user_id = u.id
ORDER BY om.created_at DESC
LIMIT 10;

-- Check seat allocation
SELECT os.org_id, o.name as org_name, c.title as course, 
       os.total_seats, os.allocated_seats,
       (os.total_seats - os.allocated_seats) as available_seats
FROM public.org_seats os
JOIN public.orgs o ON os.org_id = o.id
JOIN public.courses c ON os.course_id = c.id
ORDER BY os.created_at DESC;
