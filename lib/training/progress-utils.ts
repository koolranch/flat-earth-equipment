import { createServerClient } from '@/lib/supabase/server';

export type ResumeState = Record<string, { osha?: boolean; practice?: boolean; cards?: boolean; quiz?: boolean }>;

export function isUuid(v?: string | null): v is string {
  if (!v) return false;
  // simple UUID v4-ish check
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function resolveCourseForUser(params: {
  supabase?: ReturnType<typeof createServerClient>,
  userId: string,
  courseIdOrSlug?: string | null
}) {
  const supabase = params.supabase ?? createServerClient();
  const input = (params.courseIdOrSlug || '').trim();

  // 1) If explicit UUID provided, try that first
  if (isUuid(input)) {
    const { data: row } = await supabase.from('courses').select('id, slug').eq('id', input).maybeSingle();
    if (row) return { id: row.id, slug: row.slug } as const;
  }

  // 2) If a slug provided (e.g., 'forklift' or 'forklift_operator'), resolve it
  if (input && !isUuid(input)) {
    const { data: row } = await supabase.from('courses').select('id, slug').eq('slug', input).maybeSingle();
    if (row) return { id: row.id, slug: row.slug } as const;
  }

  // 3) Try common slugs we know about
  {
    const { data: row } = await supabase
      .from('courses')
      .select('id, slug')
      .in('slug', ['forklift', 'forklift_operator'])
      .limit(1)
      .maybeSingle();
    if (row) return { id: row.id, slug: row.slug } as const;
  }

  // 4) Fall back to the user's most recent enrollment (whatever course)
  {
    const { data: enr } = await supabase
      .from('enrollments')
      .select('course_id, course_slug')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(1);
    const row = enr?.[0];
    if (row?.course_id) return { id: row.course_id, slug: row.course_slug || '' } as const;
  }

  return { id: null as any, slug: '' } as const;
}

export async function getModuleSlugsForCourse(courseId: string, supabase = createServerClient()): Promise<string[]> {
  if (!courseId) return [];
  const { data } = await supabase
    .from('modules')
    .select('content_slug')
    .eq('course_id', courseId)
    .order('order', { ascending: true });
  return (data || []).map(m => m.content_slug).filter(Boolean) as string[];
}

// Legacy functions for backward compatibility
export async function getForkliftCourseId(supabase = createServerClient()) {
  const { data } = await supabase.from('courses').select('id').eq('slug', 'forklift').maybeSingle();
  return data?.id || null;
}

export async function getForkliftModuleSlugs(supabase = createServerClient()): Promise<string[]> {
  const courseId = await getForkliftCourseId(supabase);
  if (!courseId) return [];
  return getModuleSlugsForCourse(courseId, supabase);
}

export function computePercentAllGates(state: ResumeState, moduleSlugs: string[]): number {
  if (!moduleSlugs.length) return 0;
  let done = 0;
  for (const slug of moduleSlugs) {
    const g = state?.[slug];
    if (g && g.osha && g.practice && g.cards && g.quiz) done++;
  }
  return Math.round((done / moduleSlugs.length) * 100);
}

export function computePercentFractional(state: ResumeState, moduleSlugs: string[]): number {
  if (!moduleSlugs.length) return 0;
  const gates: (keyof NonNullable<ResumeState[string]>)[] = ['osha', 'practice', 'cards', 'quiz'];
  let sum = 0;
  for (const slug of moduleSlugs) {
    const g = state?.[slug] || {};
    for (const k of gates) sum += g[k] ? 1 : 0;
  }
  const totalGates = moduleSlugs.length * gates.length;
  return Math.round((sum / totalGates) * 100);
}

// Legacy alias for backward compatibility
export const computePercentFromState = computePercentFractional;
