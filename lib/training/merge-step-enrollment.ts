/**
 * Shared step → enrollment merge for PATCH /api/training/progress and (Phase 1c) POST step-complete.
 *
 * progress_pct formula (aligned with quiz-complete): Math.round((completedModules / 5) * 100),
 * where a module counts as completed when resume_state[slug] has at least one step flag.
 * Never lowers progress_pct below the enrollment's current value (protects quiz-complete at 100%).
 */

import {
  computeProgressPercentFromResumeState,
  getForkliftTrainingModuleSlugs,
  type TrainingStepKey,
} from '@/lib/training/progress-utils';

export type { TrainingStepKey };

export type EnrollmentForStepMerge = {
  progress_pct: number | null;
  resume_state: unknown;
};

export type MergeStepIntoEnrollmentResult = {
  resume_state: Record<string, Partial<Record<TrainingStepKey, boolean>>>;
  progress_pct: number;
};

function normalizeResumeState(
  raw: unknown,
): Record<string, Partial<Record<TrainingStepKey, boolean>>> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  return { ...(raw as Record<string, Partial<Record<TrainingStepKey, boolean>>>) };
}

/**
 * OR-merge one step flag into resume_state and recompute progress_pct (0–100).
 * Preserves unrelated top-level keys and other modules' step flags.
 */
export function mergeStepIntoEnrollment(
  enrollment: EnrollmentForStepMerge,
  moduleSlug: string,
  stepKey: TrainingStepKey,
  moduleSlugs: string[] = getForkliftTrainingModuleSlugs(),
): MergeStepIntoEnrollmentResult {
  const resume_state = normalizeResumeState(enrollment.resume_state);
  const priorModule = resume_state[moduleSlug] ?? {};
  resume_state[moduleSlug] = { ...priorModule, [stepKey]: true };

  const stepPct = computeProgressPercentFromResumeState(resume_state, moduleSlugs);
  const progress_pct = Math.max(enrollment.progress_pct ?? 0, stepPct);

  return { resume_state, progress_pct };
}
