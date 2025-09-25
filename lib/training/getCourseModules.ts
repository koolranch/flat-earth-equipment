import { createServerClient } from '@/lib/supabase/server';

export async function getCourseModules(courseSlug: string) {
  const supabase = createServerClient();
  const { data: course, error: cErr } = await supabase
    .from('courses').select('id, slug, title').eq('slug', courseSlug).maybeSingle();
  if (cErr || !course) throw new Error('course-not-found');
  const { data: modules, error: mErr } = await supabase
    .from('modules')
    .select('id, order, title, content_slug')
    .eq('course_id', course.id)
    .order('order', { ascending: true });
  if (mErr) throw new Error('modules-query-failed');
  return { course, modules: modules || [] };
}

export function toModuleHref(courseSlug: string, order: number) {
  return `/training/module/${order}?courseId=${courseSlug}`;
}
