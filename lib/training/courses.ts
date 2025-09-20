export function canonicalizeCourseParam(input?: string | null) {
  const v = (input || '').trim().toLowerCase();
  if (!v) return 'forklift';
  if (v === 'forklift_operator' || v === 'forklift-operator') return 'forklift';
  return v;
}
