import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Adjust this to your real course identifier.
const FORKLIFT_COURSE_SLUG = 'forklift';

export async function requireEnrollmentServer(opts?: { courseSlug?: string; checkoutPath?: string; }) {
  const courseSlug = opts?.courseSlug ?? FORKLIFT_COURSE_SLUG;
  const checkoutPath = opts?.checkoutPath ?? '/training/checkout';
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { enrolled: false, enrollment: null };
  
  // Look up enrollment by user_id (assuming we have course by slug)
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single();
    
  if (!course) return { enrolled: false, enrollment: null };
  
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, progress_pct, passed')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .limit(1)
    .maybeSingle();
    
  if (!enrollment) redirect(checkoutPath);
  return { enrolled: true, enrollment };
}
