import { expect, test } from '@playwright/test';
import {
  userHasExamPurchaseFromRows,
  userHasOrgAssignedExamAccessFromRows,
} from '../../lib/training/exam-access-logic';
import { buildPerfectMobileExamAnswers, gradeMobileExamAnswers } from '../../lib/training/mobile-exam-bank';

const FORKLIFT_COURSE_ID = 'f5194f6b-1750-4eef-912c-4f7807eb29ca';
const KNIGHT_ORG_ID = 'f1de0c2d-e95c-471a-80a4-90fe367d5b01';

test.describe('userHasExamPurchaseFromRows', () => {
  test('returns true for a direct forklift order', () => {
    expect(
      userHasExamPurchaseFromRows(
        [{ id: 'order-1', course_slug: 'forklift' }],
        0,
      ),
    ).toBe(true);
  });

  test('returns true when user has a claimed employer seat', () => {
    expect(userHasExamPurchaseFromRows([], 1)).toBe(true);
  });

  test('returns false with no orders or seat claims', () => {
    expect(userHasExamPurchaseFromRows([], 0)).toBe(false);
  });
});

test.describe('userHasOrgAssignedExamAccessFromRows', () => {
  test('returns true for org-assigned forklift enrollment with paid seat pool', () => {
    expect(
      userHasOrgAssignedExamAccessFromRows(
        [{ org_id: KNIGHT_ORG_ID, course_id: FORKLIFT_COURSE_ID }],
        [{ org_id: KNIGHT_ORG_ID, course_id: FORKLIFT_COURSE_ID, total_seats: 50 }],
        FORKLIFT_COURSE_ID,
      ),
    ).toBe(true);
  });

  test('returns false when org has no seat pool', () => {
    expect(
      userHasOrgAssignedExamAccessFromRows(
        [{ org_id: KNIGHT_ORG_ID, course_id: FORKLIFT_COURSE_ID }],
        [],
        FORKLIFT_COURSE_ID,
      ),
    ).toBe(false);
  });

  test('returns false for non-forklift org enrollment', () => {
    expect(
      userHasOrgAssignedExamAccessFromRows(
        [{ org_id: KNIGHT_ORG_ID, course_id: 'other-course-id' }],
        [{ org_id: KNIGHT_ORG_ID, course_id: 'other-course-id', total_seats: 50 }],
        FORKLIFT_COURSE_ID,
      ),
    ).toBe(false);
  });
});

test.describe('gradeMobileExamAnswers', () => {
  test('passes at 80% or higher', () => {
    const result = gradeMobileExamAnswers(buildPerfectMobileExamAnswers());
    expect(result.totalCount).toBe(25);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  test('fails below 80%', () => {
    const answers = Array.from({ length: 25 }, () => ({
      questionId: 'e1',
      optionId: 'a',
    }));

    const result = gradeMobileExamAnswers(answers);
    expect(result.passed).toBe(false);
  });
});
