import { createServerClient } from '@/lib/supabase/server';

export async function getModuleByOrder(courseSlug: string, order: number) {
  const supabase = createServerClient();
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (cErr || !course) throw new Error('course-not-found');

  const { data: mod, error: mErr } = await supabase
    .from('modules')
    .select('id, order, title, content_slug, type, video_url, game_asset_key')
    .eq('course_id', course.id)
    .eq('order', order)
    .maybeSingle();
  if (mErr || !mod) throw new Error('module-not-found');

  return { course, module: mod };
}

export function toModuleHref(courseSlug: string, order: number) {
  return `/training/module/${order}?courseId=${courseSlug}`;
}
