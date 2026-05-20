/**
 * Insert-only forklift enrollment for mobile progress sync.
 *
 * Used only from GET/PATCH /api/training/progress when ENSURE_ENROLLMENT_ON_PROGRESS=1.
 * Never call from Stripe webhooks, quiz-complete, seat claim, etc.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const FORKLIFT_COURSE_SLUG = 'forklift';

export type ForkliftEnrollmentRow = {
  id: string;
  progress_pct: number | null;
  passed: boolean | null;
  resume_state: unknown;
  created_at?: string | null;
};

export type EnsureForkliftEnrollmentResult = {
  enrollmentId: string;
  created: boolean;
  enrollment: ForkliftEnrollmentRow;
};

export type EnsureForkliftEnrollmentDeps = {
  findEnrollmentByCourseId: (
    userId: string,
    courseId: string,
  ) => Promise<ForkliftEnrollmentRow | null>;
  insertEnrollment: (row: {
    user_id: string;
    course_id: string;
    course_slug: string;
    progress_pct: number;
    passed: boolean;
    resume_state: Record<string, never>;
  }) => Promise<ForkliftEnrollmentRow>;
};

/**
 * Same guard pattern as ENABLE_ASK_EMPLOYER_FULFILLMENT in askEmployerFulfillment.ts.
 */
export function isEnsureEnrollmentOnProgressEnabled(envFlag: string | undefined): boolean {
  return envFlag === '1';
}

export function isForkliftCourseSlug(slug: string | undefined | null): boolean {
  return slug === FORKLIFT_COURSE_SLUG;
}

const ENROLLMENT_SELECT = 'id, progress_pct, passed, resume_state, created_at';

/**
 * SELECT-then-INSERT only. Never updates existing rows.
 * Canonical row when duplicates exist: newest by created_at (desc, limit 1).
 */
export async function ensureForkliftEnrollment(
  userId: string,
  forkliftCourseId: string,
  deps: EnsureForkliftEnrollmentDeps,
): Promise<EnsureForkliftEnrollmentResult> {
  const existing = await deps.findEnrollmentByCourseId(userId, forkliftCourseId);
  if (existing) {
    return {
      enrollmentId: existing.id,
      created: false,
      enrollment: existing,
    };
  }

  const inserted = await deps.insertEnrollment({
    user_id: userId,
    course_id: forkliftCourseId,
    course_slug: FORKLIFT_COURSE_SLUG,
    progress_pct: 0,
    passed: false,
    resume_state: {},
  });

  return {
    enrollmentId: inserted.id,
    created: true,
    enrollment: inserted,
  };
}

export function createEnsureForkliftEnrollmentDeps(
  supabase: SupabaseClient,
): EnsureForkliftEnrollmentDeps {
  return {
    async findEnrollmentByCourseId(userId, courseId) {
      const { data, error } = await supabase
        .from('enrollments')
        .select(ENROLLMENT_SELECT)
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`[ensureForkliftEnrollment] find failed: ${error.message}`);
      }

      return data?.[0] ?? null;
    },

    async insertEnrollment(row) {
      const { data, error } = await supabase
        .from('enrollments')
        .insert(row)
        .select(ENROLLMENT_SELECT)
        .single();

      if (error || !data) {
        throw new Error(
          `[ensureForkliftEnrollment] insert failed: ${error?.message ?? 'no row returned'}`,
        );
      }

      return data;
    },
  };
}

export async function ensureForkliftEnrollmentWithClient(
  supabase: SupabaseClient,
  userId: string,
  forkliftCourseId: string,
): Promise<EnsureForkliftEnrollmentResult> {
  return ensureForkliftEnrollment(
    userId,
    forkliftCourseId,
    createEnsureForkliftEnrollmentDeps(supabase),
  );
}
