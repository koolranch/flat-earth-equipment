import { supabaseServer } from '@/lib/supabase/server';

export async function getCourseBySlug(slug: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('courses').select('id, slug, title').eq('slug', slug).maybeSingle();
  if (error || !data) throw new Error('Course not found');
  return data;
}
