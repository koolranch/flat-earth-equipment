import { createServerClient } from '@/lib/supabase/server';

/** Resolve the best href for Start/Resume. */
export async function resolveResumeHref(courseSlug: string = 'forklift') {
  const supabase = createServerClient();
  // Try enrollment.resume_state → expected to contain nextModuleOrder or slug.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '/training';

  // Get enrollment for this course by slug or id
  const { data: course } = await supabase.from('courses').select('id, slug').eq('slug', courseSlug).maybeSingle();
  const courseId = course?.id;

  let enrollment: any = null;
  if (courseId) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state, course_slug')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }
  if (!enrollment) {
    const { data } = await supabase
      .from('enrollments')
      .select('id, resume_state, course_slug')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = data?.[0] || null;
  }

  // If resume_state points at a module slug, use it
  const slugFromState = (enrollment?.resume_state?.nextSlug || enrollment?.resume_state?.moduleSlug || '').trim();
  if (slugFromState) return `/training/modules/${encodeURIComponent(slugFromState)}`;

  // Otherwise, pick the first module for the course
  if (courseId) {
    const { data: first } = await supabase
      .from('modules')
      .select('content_slug, order')
      .eq('course_id', courseId)
      .order('order', { ascending: true })
      .limit(1);
    const slug = first?.[0]?.content_slug;
    if (slug) return `/training/modules/${encodeURIComponent(slug)}`;
  }
  // Fallback
  return '/training/modules/pre-op';
}
