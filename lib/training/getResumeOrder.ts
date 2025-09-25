import { createServerClient } from '@/lib/supabase/server';

/**
 * Decide where the user should resume for a given course.
 * Priority:
 * 1) enrollments.resume_state.order (if present)
 * 2) next after highest module with a passed quiz_attempt
 * 3) 1
 */
export async function getResumeOrder(courseSlug: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return 1;

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (!course) return 1;

  // 1) resume_state.order
  const { data: enr } = await supabase
    .from('enrollments')
    .select('resume_state')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .maybeSingle();
  const resumeOrder = (enr?.resume_state as any)?.order;
  if (Number.isInteger(resumeOrder) && resumeOrder > 0) return resumeOrder;

  // 2) next after highest passed quiz_attempt
  const { data: modules } = await supabase
    .from('modules')
    .select('id, order')
    .eq('course_id', course.id)
    .order('order', { ascending: true });
  const orderById = new Map((modules || []).map(m => [m.id, m.order]));

  const { data: qa } = await supabase
    .from('quiz_attempts')
    .select('module_id, passed, created_at')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .order('created_at', { ascending: false })
    .limit(200);

  const passedOrders = new Set((qa || []).filter(r => r.passed).map(r => orderById.get(r.module_id)).filter(Boolean));
  if ((modules?.length || 0) === 0) return 1;
  const maxOrder = modules![modules!.length - 1].order;
  let next = 1;
  for (let o = 1; o <= maxOrder; o++) {
    if (!passedOrders.has(o)) { next = o; break; }
    next = Math.min(maxOrder, o + 1);
  }
  return next;
}
