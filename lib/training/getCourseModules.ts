import { createServerClient } from '@/lib/supabase/server';

// Get course modules from database
export async function getCourseModules(courseSlug: string) {
  const supabase = createServerClient();
  
  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', courseSlug)
    .single();
  
  if (!course) {
    throw new Error(`Course not found: ${courseSlug}`);
  }
  
  // Get modules from database
  const { data: modules } = await supabase
    .from('modules')
    .select('id, order, title, type, content_slug, video_url, intro_url')
    .eq('course_id', course.id)
    .order('order');
  
  // Build hrefs for each module
  const modulesWithHrefs = (modules || []).map(m => {
    let href = '';
    if (m.order === 0 || /^Introduction/i.test(m.title)) {
      href = '/training/orientation';
    } else if (m.order === 99 || m.title.includes('Course Completion')) {
      href = '/training/final';
    } else if (m.content_slug) {
      href = `/training/modules/${m.content_slug}`;
    } else {
      href = `/training/module/${m.order}`;
    }
    
    return { ...m, href };
  });
  
  return {
    course,
    modules: modulesWithHrefs
  };
}

export function toModuleHref(courseSlug: string, order: number): string {
  if (order === 1) return `/training/${courseSlug}/intro`;
  return `/training/${courseSlug}/module/${order}`;
}
