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

export function resolveCourseForUser(params: { supabase: any; userId: string; courseIdOrSlug: string }): Promise<{ id: string; slug: string; title: string }> {
  return Promise.resolve({
    id: 'forklift',
    slug: params.courseIdOrSlug || 'forklift',
    title: 'Forklift Operator Training'
  });
}

export function getModuleSlugsForCourse(courseId: string, supabase?: any): string[] {
  return ['intro', 'inspection', 'safety', 'hazards', 'operations'];
}
