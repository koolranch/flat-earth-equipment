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

  // If resume_state points at a module index, use 0-based routing
  const resumeState = enrollment?.resume_state as any;
  if (resumeState?.moduleIndex !== undefined) {
    const moduleIndex = Math.max(0, Number(resumeState.moduleIndex) || 0);
    return `/training/module/${moduleIndex}`;
  }

  // If resume_state points at a module slug, use it
  const slugFromState = (resumeState?.nextSlug || resumeState?.moduleSlug || '').trim();
  if (slugFromState) return `/training/modules/${encodeURIComponent(slugFromState)}`;

  // Otherwise, pick the first module for the course using 0-based index
  if (courseId) {
    const { data: first } = await supabase
      .from('modules')
      .select('content_slug, order')
      .eq('course_id', courseId)
      .order('order', { ascending: true })
      .limit(1);
    if (first?.[0]) {
      // Convert DB order (1-based) to route index (0-based)
      const routeIndex = Math.max(0, (first[0].order || 1) - 1);
      return `/training/module/${routeIndex}`;
    }
  }
  // Fallback to Introduction (index 0)
  return '/training/module/0';
}
