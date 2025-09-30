// Stub file for route index helpers
export function buildModuleHref(order: number, courseSlug: string): string {
  // Module 1 is the pre-op module at a different path
  if (order === 1) return `/training/modules/pre-op`;
  // Modules 2-5 are at the forklift-operator path
  return `/training/forklift-operator/module-${order}`;
}

export function buildIntroHref(courseSlug: string): string {
  return `/training/orientation`;
}

export function buildCompleteHref(courseSlug: string): string {
  return `/training/final`;
}

export function readCourseSlugFromSearchParams(searchParams?: Record<string, string | string[] | undefined>): string {
  const course = searchParams?.course as string;
  const courseId = searchParams?.courseId as string;
  return course || courseId || 'forklift';
}
