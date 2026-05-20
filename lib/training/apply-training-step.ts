import type { SupabaseClient } from '@supabase/supabase-js';
import { mergeStepIntoEnrollment, type TrainingStepKey } from '@/lib/training/merge-step-enrollment';

export const TRAINING_STEP_KEYS = ['osha', 'practice', 'cards', 'quiz'] as const;

export function isTrainingStepKey(value: string): value is TrainingStepKey {
  return (TRAINING_STEP_KEYS as readonly string[]).includes(value);
}

export type TrainingCourseRef = {
  id: string;
  slug: string;
};

export type EnrollmentForTrainingStep = {
  id: string;
  resume_state: unknown;
  progress_pct: number | null;
};

export async function findEnrollmentForTrainingCourse(
  client: SupabaseClient,
  userId: string,
  course: TrainingCourseRef,
): Promise<EnrollmentForTrainingStep | null> {
  const select = 'id, resume_state, progress_pct';

  const { data: enrById } = await client
    .from('enrollments')
    .select(select)
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .order('created_at', { ascending: false })
    .limit(1);

  let enrollment: EnrollmentForTrainingStep | null = enrById?.[0] ?? null;

  if (!enrollment && course.slug) {
    const { data: enrBySlug } = await client
      .from('enrollments')
      .select(select)
      .eq('user_id', userId)
      .eq('course_slug', course.slug)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrBySlug?.[0] ?? null;
  }

  return enrollment;
}

export type ApplyTrainingStepResult = {
  progress_pct: number;
  resume_state: Record<string, Partial<Record<TrainingStepKey, boolean>>>;
};

/**
 * OR-merge step into enrollment and persist (shared by PATCH progress and POST step-complete).
 */
export async function applyTrainingStepToEnrollment(
  client: SupabaseClient,
  enrollment: EnrollmentForTrainingStep,
  moduleSlug: string,
  stepKey: TrainingStepKey,
): Promise<ApplyTrainingStepResult> {
  const { resume_state, progress_pct } = mergeStepIntoEnrollment(enrollment, moduleSlug, stepKey);

  const { error: updErr } = await client
    .from('enrollments')
    .update({ resume_state, progress_pct, updated_at: new Date().toISOString() })
    .eq('id', enrollment.id);

  if (updErr) {
    throw new Error(updErr.message);
  }

  return { progress_pct, resume_state };
}
