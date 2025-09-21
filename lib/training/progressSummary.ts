import { createServerClient } from '@/lib/supabase/server';

export async function getProgressSummary(courseSlug: string = 'forklift') {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pct: 0, completed: 0, total: 0, remaining: 0, nextHref: '/training' };

  // Find course
  const { data: course } = await supabase.from('courses').select('id, slug').eq('slug', courseSlug).maybeSingle();
  const courseId = course?.id;

  // Count modules
  let total = 0;
  if (courseId) {
    const { data: mods } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId);
    total = mods?.length || 0;
  }

  // Enrollment + resume
  let enrollment: any = null;
  if (courseId) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, progress_pct, resume_state, course_slug')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }
  if (!enrollment) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, progress_pct, resume_state, course_slug')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }

  const pct = Math.max(0, Math.min(100, Math.round((enrollment?.progress_pct ?? 0))));
  const completed = total ? Math.min(total, Math.max(0, Math.round((pct / 100) * total))) : 0;
  const remaining = Math.max(0, total - completed);

  const nextSlug = (enrollment?.resume_state?.nextSlug || enrollment?.resume_state?.moduleSlug || '').trim();
  const nextHref = nextSlug ? `/training/modules/${encodeURIComponent(nextSlug)}` : '/training/modules/pre-op';

  return { pct, completed, total, remaining, nextHref };
}
