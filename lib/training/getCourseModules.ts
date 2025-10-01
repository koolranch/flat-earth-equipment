import { createServerClient } from '@/lib/supabase/server';

// Get course modules from database
export async function getCourseModules(courseSlug: string) {
  const supabase = createServerClient();
  
  console.log('[getCourseModules] Fetching modules for:', courseSlug, 'at', new Date().toISOString());
  
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
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, order, title, type, content_slug, video_url, intro_url')
    .eq('course_id', course.id)
    .order('order');
  
  console.log('[getCourseModules] Loaded modules:', modules?.map(m => ({ title: m.title, order: m.order })));
  
  if (modulesError) {
    console.error('[getCourseModules] Error loading modules:', modulesError);
  }
  
  // Build hrefs for each module - use specific module pages
  const modulesWithHrefs = (modules || []).map(m => {
    let href = '';
    
    // Map to actual module page routes
    if (m.order === 0 || /^Introduction/i.test(m.title)) {
      href = '/training/orientation';
    } else if (m.order === 99 || m.title.includes('Course Completion')) {
      href = '/training/final';
    } else if (m.order === 1) {
      href = '/training/modules/pre-op';
    } else if (m.order === 2) {
      href = '/training/module/2'; // 8-Point Inspection
    } else if (m.order === 3) {
      href = '/training/module/3'; // Balance & Load
    } else if (m.order === 4) {
      href = '/training/module/4'; // Hazard Hunt
    } else if (m.order === 5) {
      href = '/training/module/5'; // Advanced Operations
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
