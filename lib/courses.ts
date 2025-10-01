export const DEFAULT_COURSE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_COURSE || 'forklift_operator';
export function coerceCourseId(v?: string | null){ return (v && v.trim()) || DEFAULT_COURSE_SLUG; }

export type UIModule = { order: number; key: string; title: string; href: string; type?: 'video'|'game'|'quiz'|'completion' };

// Fallback list used when API/DB is empty
export const FORKLIFT_MODULES_FALLBACK: UIModule[] = [
  { order: 0, key: 'intro',    title: 'Introduction',                       href: '/training/orientation',                      type: 'video' },
  { order: 1, key: 'preop',    title: 'Module 1: Pre-Operation Inspection', href: '/training/modules/pre-op',                   type: 'game' },
  { order: 2, key: 'eight',    title: 'Module 2: 8-Point Inspection',       href: '/training/module/2',                         type: 'game' },
  { order: 3, key: 'balance',  title: 'Module 3: Balance & Load Handling',  href: '/training/module/3',                         type: 'game' },
  { order: 4, key: 'hazards',  title: 'Module 4: Hazard Hunt',              href: '/training/module/4',                         type: 'game' },
  { order: 5, key: 'shutdown', title: 'Module 5: Advanced Operations',      href: '/training/module/5',                         type: 'game' },
  { order: 99, key: 'done',    title: 'Course Completion',                   href: '/training/final',                            type: 'completion' }
];
