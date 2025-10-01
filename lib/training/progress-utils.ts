// Stub file for progress utilities
export function calculateProgress(completed: string[], total: number): number {
  return Math.round((completed.length / total) * 100);
}

export function getNextModule(currentModule: number, completed: string[]): number | null {
  const nextModule = currentModule + 1;
  return nextModule <= 5 ? nextModule : null;
}

export function getForkliftCourseId(): string {
  return 'forklift';
}

export function getForkliftModuleSlugs(): string[] {
  return ['intro', 'inspection', 'safety', 'hazards', 'operations'];
}

export function computePercentFractional(state: any, moduleSlugs: string[]): number {
  if (!state || !moduleSlugs) return 0;
  const completedCount = moduleSlugs.filter(slug => state[slug] && Object.keys(state[slug]).length > 0).length;
  return moduleSlugs.length > 0 ? completedCount / moduleSlugs.length : 0;
}

export async function resolveCourseForUser(params: { supabase: any; userId: string; courseIdOrSlug: string }): Promise<{ id: string; slug: string; title: string }> {
  // Query the actual course from database
  const { data: course, error } = await params.supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', params.courseIdOrSlug || 'forklift')
    .single();
  
  if (error || !course) {
    console.error('[resolveCourseForUser] Error finding course:', error?.message);
    // Fallback to prevent total failure
    return {
      id: params.courseIdOrSlug || 'forklift',
      slug: params.courseIdOrSlug || 'forklift',
      title: 'Forklift Operator Training'
    };
  }
  
  return course;
}

export function getModuleSlugsForCourse(courseId: string, supabase?: any): string[] {
  return ['intro', 'inspection', 'safety', 'hazards', 'operations'];
}
