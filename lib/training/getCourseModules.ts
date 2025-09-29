// Stub file for getting course modules
export async function getCourseModules(courseSlug: string) {
  return {
    course: { id: 'forklift', slug: courseSlug, title: 'Forklift Operator Training' },
    modules: [
      { id: 1, order: 1, title: 'Introduction', content_slug: null },
      { id: 2, order: 2, title: 'Module 2: 8-Point Inspection', content_slug: 'inspection' },
      { id: 3, order: 3, title: 'Module 3: Safety Guidelines', content_slug: 'safety' },
      { id: 4, order: 4, title: 'Module 4: Hazard Recognition', content_slug: 'hazards' },
      { id: 5, order: 5, title: 'Module 5: Operations', content_slug: 'operations' },
    ]
  };
}

export function toModuleHref(courseSlug: string, order: number): string {
  if (order === 1) return `/training/${courseSlug}/intro`;
  return `/training/${courseSlug}/module/${order}`;
}
