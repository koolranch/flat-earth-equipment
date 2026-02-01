-- Add course_id to invitations for "invite and enroll" flow
-- When a user accepts an invitation with a course_id, they'll be auto-enrolled

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

-- Index for looking up invitations by course
CREATE INDEX IF NOT EXISTS invitations_course_idx ON public.invitations(course_id) WHERE course_id IS NOT NULL;

COMMENT ON COLUMN public.invitations.course_id IS 'Optional: auto-enroll user in this course when they accept the invitation';

-- Update the accept_invitation function to also create enrollment if course_id is set
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

COMMENT ON FUNCTION public.accept_invitation(text) IS 'Accept an org invitation for the current authenticated user, optionally enrolling in assigned course';
