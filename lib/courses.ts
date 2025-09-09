export const DEFAULT_COURSE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_COURSE || "forklift_operator";
export function coerceCourseId(input?: string | null) {
  return (input && String(input).trim()) || DEFAULT_COURSE_SLUG;
}
