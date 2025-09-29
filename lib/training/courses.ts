// Stub file for training courses
export function canonicalizeCourseParam(param: string | null): string {
  if (!param) return 'forklift';
  return param.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}

export function readCourseSlugFromSearchParams(searchParams?: Record<string, string | string[] | undefined>): string {
  const course = searchParams?.course as string;
  const courseId = searchParams?.courseId as string;
  return canonicalizeCourseParam(course || courseId);
}
