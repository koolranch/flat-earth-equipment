/**
 * POST /api/training/modules/[contentSlug]/steps/[stepSlug]/complete (Phase 1c).
 *
 * Run: npx playwright test tests/integration/step-complete-route.spec.ts
 */

import { expect, test } from '@playwright/test';
import { isTrainingStepKey } from '../../lib/training/apply-training-step';
import { ensureForkliftEnrollment } from '../../lib/training/ensure-forklift-enrollment';
import { mergeStepIntoEnrollment } from '../../lib/training/merge-step-enrollment';
import { isEnsureEnrollmentOnProgressEnabled } from '../../lib/training/ensure-forklift-enrollment';

const USER_ID = 'mobile-user-1';
const COURSE_ID = 'forklift-course-uuid';
const CONTENT_SLUG = 'pre-operation-inspection';

type EnrollmentRow = {
  id: string;
  progress_pct: number | null;
  passed?: boolean;
  resume_state: unknown;
  course_slug?: string;
};

/**
 * Simulates POST step-complete: ensure (if flag) → find enrollment → applyTrainingStep.
 */
async function simulateStepComplete(opts: {
  flagOn: boolean;
  initialEnrollment: EnrollmentRow | null;
  stepKey: 'osha' | 'practice';
}): Promise<{
  enrollment: EnrollmentRow;
  created: boolean;
  progress_pct: number;
  resume_state: Record<string, unknown>;
}> {
  let enrollment: EnrollmentRow | null = opts.initialEnrollment;
  let created = false;

  if (opts.flagOn) {
    const ensureResult = await ensureForkliftEnrollment(USER_ID, COURSE_ID, {
      findEnrollmentByCourseId: async () =>
        enrollment
          ? {
              id: enrollment.id,
              progress_pct: enrollment.progress_pct,
              passed: enrollment.passed ?? false,
              resume_state: enrollment.resume_state,
            }
          : null,
      insertEnrollment: async (row) => {
        created = true;
        enrollment = {
          id: 'new-enrollment-id',
          progress_pct: row.progress_pct,
          passed: row.passed,
          resume_state: row.resume_state,
          course_slug: row.course_slug,
        };
        return {
          id: enrollment.id,
          progress_pct: enrollment.progress_pct,
          passed: enrollment.passed ?? false,
          resume_state: enrollment.resume_state,
        };
      },
    });
    if (!enrollment) {
      enrollment = {
        id: ensureResult.enrollmentId,
        progress_pct: ensureResult.enrollment.progress_pct,
        passed: ensureResult.enrollment.passed ?? false,
        resume_state: ensureResult.enrollment.resume_state,
        course_slug: 'forklift',
      };
      created = ensureResult.created;
    }
  }

  if (!enrollment) {
    throw new Error('not_enrolled');
  }

  const merged = mergeStepIntoEnrollment(enrollment, CONTENT_SLUG, opts.stepKey);
  enrollment = {
    ...enrollment,
    progress_pct: merged.progress_pct,
    resume_state: merged.resume_state,
  };

  return {
    enrollment,
    created,
    progress_pct: merged.progress_pct,
    resume_state: merged.resume_state as Record<string, unknown>,
  };
}

test.describe('isTrainingStepKey', () => {
  test('accepts mobile step keys', () => {
    expect(isTrainingStepKey('osha')).toBe(true);
    expect(isTrainingStepKey('practice')).toBe(true);
    expect(isTrainingStepKey('cards')).toBe(true);
    expect(isTrainingStepKey('quiz')).toBe(true);
    expect(isTrainingStepKey('invalid')).toBe(false);
  });
});

test.describe('POST step-complete flow (simulated)', () => {
  test('flag on, no enrollment → created, osha → progress_pct 20', async () => {
    const prev = process.env.ENSURE_ENROLLMENT_ON_PROGRESS;
    process.env.ENSURE_ENROLLMENT_ON_PROGRESS = '1';
    expect(isEnsureEnrollmentOnProgressEnabled(process.env.ENSURE_ENROLLMENT_ON_PROGRESS)).toBe(true);

    const result = await simulateStepComplete({
      flagOn: true,
      initialEnrollment: null,
      stepKey: 'osha',
    });

    expect(result.created).toBe(true);
    expect(result.enrollment.course_slug).toBe('forklift');
    expect(result.progress_pct).toBe(20);
    expect(result.resume_state[CONTENT_SLUG]).toEqual({ osha: true });

    process.env.ENSURE_ENROLLMENT_ON_PROGRESS = prev;
  });

  test('second step same module OR-merges, progress_pct stays 20', async () => {
    const first = await simulateStepComplete({
      flagOn: false,
      initialEnrollment: { id: 'enr-1', progress_pct: 0, resume_state: {} },
      stepKey: 'osha',
    });

    const second = await simulateStepComplete({
      flagOn: false,
      initialEnrollment: first.enrollment,
      stepKey: 'practice',
    });

    expect(second.progress_pct).toBe(20);
    expect(second.resume_state[CONTENT_SLUG]).toEqual({ osha: true, practice: true });
  });

  test('user at progress_pct 100 — POST merge does not reduce pct', async () => {
    const result = await simulateStepComplete({
      flagOn: false,
      initialEnrollment: {
        id: 'enr-100',
        progress_pct: 100,
        resume_state: {},
      },
      stepKey: 'osha',
    });

    expect(result.progress_pct).toBe(100);
  });

  test('flag on with existing 100% enrollment — ensure no-op, pct stays 100', async () => {
    const existing = {
      id: 'enr-100',
      progress_pct: 100,
      passed: true,
      resume_state: { 'pre-operation-inspection': { quiz: true } },
    };

    let insertCalled = false;
    await ensureForkliftEnrollment(USER_ID, COURSE_ID, {
      findEnrollmentByCourseId: async () => ({
        id: existing.id,
        progress_pct: existing.progress_pct,
        passed: existing.passed,
        resume_state: existing.resume_state,
      }),
      insertEnrollment: async () => {
        insertCalled = true;
        throw new Error('should not insert');
      },
    });

    expect(insertCalled).toBe(false);

    const result = await simulateStepComplete({
      flagOn: false,
      initialEnrollment: existing,
      stepKey: 'osha',
    });

    expect(result.progress_pct).toBe(100);
    expect(result.resume_state[CONTENT_SLUG]).toEqual({ quiz: true, osha: true });
  });
});
