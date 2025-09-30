// Stub file for getting course modules
export async function getCourseModules(courseSlug: string) {
  return {
    course: { id: 'forklift', slug: courseSlug, title: 'Forklift Operator Training' },
    modules: [
      { id: 0, order: 0, title: 'Introduction', content_slug: null, href: '/training/orientation' },
      { id: 1, order: 1, title: 'Module 1: Pre-Operation Inspection', content_slug: 'preop', href: '/training/modules/pre-op' },
      { id: 2, order: 2, title: 'Module 2: 8-Point Inspection', content_slug: 'inspection', href: '/training/forklift-operator/module-2' },
      { id: 3, order: 3, title: 'Module 3: Balance & Load Handling', content_slug: 'balance', href: '/training/forklift-operator/module-3' },
      { id: 4, order: 4, title: 'Module 4: Hazard Hunt', content_slug: 'hazards', href: '/training/forklift-operator/module-4' },
      { id: 5, order: 5, title: 'Module 5: Advanced Operations', content_slug: 'operations', href: '/training/forklift-operator/module-5' },
      { id: 6, order: 6, title: 'Course Completion', content_slug: null, href: '/training/final' },
    ]
  };
}

export function toModuleHref(courseSlug: string, order: number): string {
  if (order === 1) return `/training/${courseSlug}/intro`;
  return `/training/${courseSlug}/module/${order}`;
}
