export function readCourseSlugFromSearchParams(sp: Record<string, string | string[] | undefined> | undefined, fallback = 'forklift') {
  if (!sp) return fallback;
  const a = (v: unknown) => (Array.isArray(v) ? v[0] : v);
  return (a(sp['courseId']) as string) || (a(sp['course']) as string) || fallback;
}
export function buildModuleHref(order: number, courseSlug: string) {
  return `/training/module/${order}?courseId=${encodeURIComponent(courseSlug)}`;
}
export function buildIntroHref(courseSlug: string) {
  return `/training/intro?courseId=${encodeURIComponent(courseSlug)}`;
}
export function buildCompleteHref(courseSlug: string) {
  return `/training/complete?courseId=${encodeURIComponent(courseSlug)}`;
}