import { createServerClient } from '@/lib/supabase/server';

export type ResumeState = Record<string, { osha?: boolean; practice?: boolean; cards?: boolean; quiz?: boolean }>;

export async function getForkliftCourseId(supabase = createServerClient()) {
  const { data } = await supabase.from('courses').select('id').eq('slug', 'forklift').maybeSingle();
  return data?.id || null;
}

export async function getForkliftModuleSlugs(supabase = createServerClient()): Promise<string[]> {
  const courseId = await getForkliftCourseId(supabase);
  if (!courseId) return [];
  const { data } = await supabase
    .from('modules')
    .select('content_slug')
    .eq('course_id', courseId)
    .order('order', { ascending: true });
  return (data || []).map(m => m.content_slug).filter(Boolean) as string[];
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
