export function getCourseSlugFromSearch(searchParams: URLSearchParams): string | null {
  // Be liberal: support ?courseId= and ?course=
  return searchParams.get('courseId') || searchParams.get('course');
}
