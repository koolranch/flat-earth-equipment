/**
 * mergeStepIntoEnrollment + progress_pct from resume_state (Phase 1b).
 *
 * Run: npx playwright test tests/integration/merge-step-enrollment.spec.ts
 */

import { expect, test } from '@playwright/test';
import { mergeStepIntoEnrollment } from '../../lib/training/merge-step-enrollment';
import {
  computeProgressPercentFromResumeState,
  getForkliftTrainingModuleSlugs,
} from '../../lib/training/progress-utils';
import { ensureForkliftEnrollment } from '../../lib/training/ensure-forklift-enrollment';

const MODULE_SLUGS = getForkliftTrainingModuleSlugs();

test.describe('getForkliftTrainingModuleSlugs', () => {
  test('uses registry content slugs (5 modules)', () => {
    expect(MODULE_SLUGS).toEqual([
      'pre-operation-inspection',
      'eight-point-inspection',
      'stability-and-load-handling',
      'safe-operation-and-hazards',
      'shutdown-and-parking',
    ]);
  });
});

test.describe('computeProgressPercentFromResumeState', () => {
  test('one module with a step → 20% (quiz-complete parity)', () => {
    const pct = computeProgressPercentFromResumeState(
      { 'pre-operation-inspection': { osha: true } },
      MODULE_SLUGS,
    );
    expect(pct).toBe(20);
    expect(pct).not.toBe(0.2);
  });
});

test.describe('mergeStepIntoEnrollment', () => {
  test('PATCH osha on pre-operation-inspection → progress_pct 20', () => {
    const result = mergeStepIntoEnrollment(
      { progress_pct: 0, resume_state: {} },
      'pre-operation-inspection',
      'osha',
    );

    expect(result.progress_pct).toBe(20);
    expect(result.resume_state['pre-operation-inspection']).toEqual({ osha: true });
  });

  test('merges second step without losing first', () => {
    const first = mergeStepIntoEnrollment(
      { progress_pct: 0, resume_state: {} },
      'pre-operation-inspection',
      'osha',
    );

    const second = mergeStepIntoEnrollment(
      { progress_pct: first.progress_pct, resume_state: first.resume_state },
      'pre-operation-inspection',
      'practice',
    );

    expect(second.resume_state['pre-operation-inspection']).toEqual({
      osha: true,
      practice: true,
    });
    expect(second.progress_pct).toBe(20);
  });

  test('preserves unrelated resume_state keys (e.g. legacy doneOrders)', () => {
    const result = mergeStepIntoEnrollment(
      {
        progress_pct: 0,
        resume_state: { doneOrders: [1], lastOrder: 2 },
      },
      'pre-operation-inspection',
      'osha',
    );

    expect(result.resume_state.doneOrders).toEqual([1]);
    expect(result.resume_state.lastOrder).toBe(2);
    expect(result.resume_state['pre-operation-inspection']).toEqual({ osha: true });
  });

  test('user at progress_pct 100 — merge does not lower progress_pct', () => {
    const result = mergeStepIntoEnrollment(
      {
        progress_pct: 100,
        resume_state: {},
      },
      'pre-operation-inspection',
      'osha',
    );

    expect(result.progress_pct).toBe(100);
  });
});

test.describe('ensure + PATCH contract (quiz_attempts untouched)', () => {
  test('ensure on existing 100% enrollment is insert-only no-op', async () => {
    const existing = {
      id: 'enr-100',
      progress_pct: 100,
      passed: true,
      resume_state: { 'pre-operation-inspection': { quiz: true } },
      created_at: '2025-01-01T00:00:00Z',
    };

    let insertCalled = false;
    const result = await ensureForkliftEnrollment('user-1', 'course-1', {
      findEnrollmentByCourseId: async () => existing,
      insertEnrollment: async () => {
        insertCalled = true;
        throw new Error('should not insert');
      },
    });

    expect(result.created).toBe(false);
    expect(result.enrollment.progress_pct).toBe(100);
    expect(insertCalled).toBe(false);
  });
});
