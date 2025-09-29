// Stub file for route index helpers
export function buildModuleHref(order: number, courseSlug: string): string {
  return `/training/forklift-operator/module-${order}`;
}

export function buildIntroHref(courseSlug: string): string {
  return `/training/intro`;
}

export function buildCompleteHref(courseSlug: string): string {
  return `/training/final`;
}

export function readCourseSlugFromSearchParams(searchParams?: Record<string, string | string[] | undefined>): string {
  const course = searchParams?.course as string;
  const courseId = searchParams?.courseId as string;
  return course || courseId || 'forklift';
}
