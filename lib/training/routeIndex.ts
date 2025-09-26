export function courseParamName() {
  // Single source of truth for outbound links
  return 'courseId';
}

export function readCourseSlug(searchParams: URLSearchParams, fallback = 'forklift') {
  // Accept both, prefer courseId
  return searchParams.get('courseId') || searchParams.get('course') || fallback;
}

export function buildModuleHref(order: number, courseSlug: string) {
  const key = courseParamName();
  return `/training/module/${order}?${key}=${encodeURIComponent(courseSlug)}`;
}

export function buildIntroHref(courseSlug: string) {
  const key = courseParamName();
  return `/training/intro?${key}=${encodeURIComponent(courseSlug)}`;
}

export function buildCompleteHref(courseSlug: string) {
  const key = courseParamName();
  return `/training/complete?${key}=${encodeURIComponent(courseSlug)}`;
}