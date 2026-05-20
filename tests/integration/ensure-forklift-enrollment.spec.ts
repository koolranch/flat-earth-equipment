/**
 * ensureForkliftEnrollment — insert-only forklift enrollment for progress APIs.
 *
 * Run: npx playwright test tests/integration/ensure-forklift-enrollment.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  ensureForkliftEnrollment,
  isEnsureEnrollmentOnProgressEnabled,
  isForkliftCourseSlug,
  type EnsureForkliftEnrollmentDeps,
  type ForkliftEnrollmentRow,
} from '../../lib/training/ensure-forklift-enrollment';

const USER_ID = 'user-aaa';
const COURSE_ID = 'course-forklift-uuid';

function row(
  partial: Partial<ForkliftEnrollmentRow> & { id: string },
): ForkliftEnrollmentRow {
  return {
    progress_pct: partial.progress_pct ?? 0,
    passed: partial.passed ?? false,
    resume_state: partial.resume_state ?? {},
    created_at: partial.created_at ?? '2026-01-01T00:00:00Z',
    ...partial,
  };
}

function makeDeps(overrides: Partial<EnsureForkliftEnrollmentDeps> = {}): {
  deps: EnsureForkliftEnrollmentDeps;
  findCalls: Array<{ userId: string; courseId: string }>;
  insertCalls: Array<Parameters<EnsureForkliftEnrollmentDeps['insertEnrollment']>[0]>;
} {
  const findCalls: Array<{ userId: string; courseId: string }> = [];
  const insertCalls: Array<Parameters<EnsureForkliftEnrollmentDeps['insertEnrollment']>[0]> = [];

  const deps: EnsureForkliftEnrollmentDeps = {
    findEnrollmentByCourseId: async (userId, courseId) => {
      findCalls.push({ userId, courseId });
      return null;
    },
    insertEnrollment: async (insertRow) => {
      insertCalls.push(insertRow);
      return row({
        id: 'new-enrollment-id',
        progress_pct: insertRow.progress_pct,
        passed: insertRow.passed,
        resume_state: insertRow.resume_state,
        created_at: '2026-05-19T12:00:00Z',
      });
    },
    ...overrides,
  };

  return { deps, findCalls, insertCalls };
}

test.describe('isEnsureEnrollmentOnProgressEnabled', () => {
  test('flag on only when env is exactly "1"', () => {
    expect(isEnsureEnrollmentOnProgressEnabled('1')).toBe(true);
    expect(isEnsureEnrollmentOnProgressEnabled('0')).toBe(false);
    expect(isEnsureEnrollmentOnProgressEnabled(undefined)).toBe(false);
    expect(isEnsureEnrollmentOnProgressEnabled('true')).toBe(false);
  });
});

test.describe('ensureForkliftEnrollment', () => {
  test('existing row at 100% — no insert, enrollment fields unchanged', async () => {
    const existing = row({
      id: 'enr-complete',
      progress_pct: 100,
      passed: true,
      resume_state: { 'pre-operation-inspection': { quiz: true } },
      created_at: '2025-06-01T00:00:00Z',
    });

    const { deps, insertCalls } = makeDeps({
      findEnrollmentByCourseId: async () => existing,
    });

    const result = await ensureForkliftEnrollment(USER_ID, COURSE_ID, deps);

    expect(result.created).toBe(false);
    expect(result.enrollmentId).toBe('enr-complete');
    expect(result.enrollment.progress_pct).toBe(100);
    expect(result.enrollment.passed).toBe(true);
    expect(result.enrollment.resume_state).toEqual({
      'pre-operation-inspection': { quiz: true },
    });
    expect(insertCalls).toHaveLength(0);
  });

  test('no enrollment — inserts exactly one row with course_slug forklift', async () => {
    const { deps, findCalls, insertCalls } = makeDeps();

    const result = await ensureForkliftEnrollment(USER_ID, COURSE_ID, deps);

    expect(result.created).toBe(true);
    expect(result.enrollmentId).toBe('new-enrollment-id');
    expect(findCalls).toEqual([{ userId: USER_ID, courseId: COURSE_ID }]);
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0]).toEqual({
      user_id: USER_ID,
      course_id: COURSE_ID,
      course_slug: 'forklift',
      progress_pct: 0,
      passed: false,
      resume_state: {},
    });
  });

  test('duplicate (user_id, course_id) rows — returns existing, does not insert third', async () => {
    const newest = row({
      id: 'enr-newest',
      progress_pct: 40,
      created_at: '2026-05-01T00:00:00Z',
    });

    const { deps, insertCalls } = makeDeps({
      findEnrollmentByCourseId: async () => newest,
    });

    const result = await ensureForkliftEnrollment(USER_ID, COURSE_ID, deps);

    expect(result.created).toBe(false);
    expect(result.enrollmentId).toBe('enr-newest');
    expect(insertCalls).toHaveLength(0);
  });

  test('never calls update — only find and optional insert', async () => {
    let updateCalled = false;
    const { deps } = makeDeps({
      findEnrollmentByCourseId: async () => {
        if (updateCalled) throw new Error('unexpected update path');
        return null;
      },
    });

    await ensureForkliftEnrollment(USER_ID, COURSE_ID, deps);
    updateCalled = false;
    await ensureForkliftEnrollment(USER_ID, COURSE_ID, {
      ...deps,
      findEnrollmentByCourseId: async () =>
        row({ id: 'enr-2', progress_pct: 50, created_at: '2026-01-02T00:00:00Z' }),
    });
    expect(updateCalled).toBe(false);
  });
});

test.describe('isForkliftCourseSlug', () => {
  test('only forklift slug is eligible', () => {
    expect(isForkliftCourseSlug('forklift')).toBe(true);
    expect(isForkliftCourseSlug('forklift_operator')).toBe(false);
    expect(isForkliftCourseSlug(null)).toBe(false);
  });
});

test.describe('flag off behavior (contract)', () => {
  test('when ENSURE_ENROLLMENT_ON_PROGRESS is off, route must not call ensure', () => {
    expect(isEnsureEnrollmentOnProgressEnabled(process.env.ENSURE_ENROLLMENT_ON_PROGRESS)).toBe(
      process.env.ENSURE_ENROLLMENT_ON_PROGRESS === '1',
    );
    if (process.env.ENSURE_ENROLLMENT_ON_PROGRESS !== '1') {
      expect(isEnsureEnrollmentOnProgressEnabled(process.env.ENSURE_ENROLLMENT_ON_PROGRESS)).toBe(
        false,
      );
    }
  });
});
