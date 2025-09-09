export const DEFAULT_COURSE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_COURSE || 'forklift_operator';
export function coerceCourseId(v?: string | null){ return (v && v.trim()) || DEFAULT_COURSE_SLUG; }

export type UIModule = { order: number; key: string; title: string; href: string; type?: 'video'|'game'|'quiz'|'completion' };

// Fallback list used when API/DB is empty
export const FORKLIFT_MODULES_FALLBACK: UIModule[] = [
  { order: 0, key: 'intro',    title: 'Introduction',                       href: '/training/orientation',                      type: 'video' },
  { order: 1, key: 'preop',    title: 'Module 1: Pre-Operation Inspection', href: '/training/modules/preop',                    type: 'game' },
  { order: 2, key: 'eight',    title: 'Module 2: 8-Point Inspection',       href: '/training/modules/8-point',                 type: 'game' },
  { order: 3, key: 'balance',  title: 'Module 3: Balance & Load Handling',  href: '/training/modules/balance',                 type: 'game' },
  { order: 4, key: 'hazards',  title: 'Module 4: Hazard Hunt',              href: '/training/modules/hazards',                 type: 'game' },
  { order: 5, key: 'shutdown', title: 'Module 5: Shutdown Sequence',        href: '/training/modules/shutdown',                type: 'game' },
  { order: 6, key: 'done',     title: 'Course Completion',                   href: '/training/completion',                      type: 'completion' }
];
