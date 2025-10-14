// Stub file for route index helpers
export function buildModuleHref(order: number, courseSlug: string): string {
  // Module 1 is at upgraded mobile-optimized path
  if (order === 1) return `/training/module-1`;
  // Modules 2-5 are at the standard forklift-operator path
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
