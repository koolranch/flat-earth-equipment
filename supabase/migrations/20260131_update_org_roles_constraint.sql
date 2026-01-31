-- Update org_members role constraint to support new RBAC roles
-- Migration: Add new enterprise role types to org_members table

-- Drop the old constraint
ALTER TABLE public.org_members DROP CONSTRAINT IF EXISTS org_members_role_check;

-- Add new constraint with both legacy and new roles
ALTER TABLE public.org_members 
ADD CONSTRAINT org_members_role_check 
CHECK (role IN (
  -- Legacy roles (maintain backward compatibility)
  'owner',
  'trainer', 
  'learner',
  -- New RBAC roles
  'admin',
  'manager',
  'member',
  'viewer',
  'super_admin'
));

-- Add helpful comment
COMMENT ON COLUMN public.org_members.role IS 'User role in organization. Legacy: owner/trainer/learner. New RBAC: owner/admin/manager/member/viewer/super_admin';

-- Optional: Add index for faster role lookups
CREATE INDEX IF NOT EXISTS org_members_role_idx ON public.org_members(role);
