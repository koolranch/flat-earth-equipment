import { getAllModules } from '@/lib/modules/registry';

export type TrainingStepKey = 'osha' | 'practice' | 'cards' | 'quiz';

export function calculateProgress(completed: string[], total: number): number {
  return Math.round((completed.length / total) * 100);
}

export function getNextModule(currentModule: number, completed: string[]): number | null {
  const nextModule = currentModule + 1;
  return nextModule <= 5 ? nextModule : null;
}

export function getForkliftCourseId(): string {
  return 'forklift';
}

/** @deprecated Use getForkliftTrainingModuleSlugs — registry content slugs only */
export function getForkliftModuleSlugs(): string[] {
  return getForkliftTrainingModuleSlugs();
}

/**
 * Registry content slugs for forklift training modules 1–5 (same set mobile sends as moduleSlug).
 */
export function getForkliftTrainingModuleSlugs(): string[] {
  return getAllModules().map((m) => m.slug);
}

/**
 * @deprecated Use getForkliftTrainingModuleSlugs
 */
export function getModuleSlugsForCourse(_courseId?: string, _supabase?: unknown): string[] {
  return getForkliftTrainingModuleSlugs();
}

/**
 * progress_pct from resume_state step flags (0–100), matching quiz-complete:
 * Math.round((completedModules / totalModules) * 100).
 * A module counts when resume_state[slug] has at least one completed step.
 */
export function computeProgressPercentFromResumeState(
  state: Record<string, Partial<Record<TrainingStepKey, boolean>>> | null | undefined,
  moduleSlugs: string[],
): number {
  if (!state || !moduleSlugs.length) return 0;

  const completedCount = moduleSlugs.filter((slug) => {
    const mod = state[slug];
    return mod && typeof mod === 'object' && Object.keys(mod).some((k) => mod[k as TrainingStepKey]);
  }).length;

  return Math.round((completedCount / moduleSlugs.length) * 100);
}

/** @deprecated Use computeProgressPercentFromResumeState — previously returned 0–1 fraction */
export function computePercentFractional(state: unknown, moduleSlugs: string[]): number {
  const normalized =
    state && typeof state === 'object' && !Array.isArray(state)
      ? (state as Record<string, Partial<Record<TrainingStepKey, boolean>>>)
      : null;
  return computeProgressPercentFromResumeState(normalized, moduleSlugs);
}

export async function resolveCourseForUser(params: {
  supabase: any;
  userId: string;
  courseIdOrSlug: string;
}): Promise<{ id: string; slug: string; title: string }> {
  const { data: course, error } = await params.supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', params.courseIdOrSlug || 'forklift')
    .single();

  if (error || !course) {
    console.error('[resolveCourseForUser] Error finding course:', error?.message);
    return {
      id: params.courseIdOrSlug || 'forklift',
      slug: params.courseIdOrSlug || 'forklift',
      title: 'Forklift Operator Training',
    };
  }

  return course;
}
