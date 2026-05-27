import { expect, test } from '@playwright/test';
import { userHasExamPurchaseFromRows } from '../../lib/training/exam-access-logic';
import { buildPerfectMobileExamAnswers, gradeMobileExamAnswers } from '../../lib/training/mobile-exam-bank';

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
