-- Fix RLS circular reference causing stack depth limit exceeded
-- This removes the problematic module_read_enrolled policy that creates circular dependency

-- Drop the problematic policy that causes circular reference
DROP POLICY IF EXISTS "module_read_enrolled" ON public.modules;

-- The existing "modules_read" policy (select using true) is sufficient
-- since we control access at the application level through enrollments
