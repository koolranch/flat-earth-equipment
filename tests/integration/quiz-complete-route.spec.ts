/**
 * POST /api/training/quiz-complete — Bearer + progress / exam unlock helpers (Phase 1d).
 *
 * Run: npx playwright test tests/integration/quiz-complete-route.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  computeCanTakeExamFromAttempts,
  computeQuizBasedProgressPct,
  filterTrainingModulesByOrder,
  resolveModuleByIdOrOrder,
  type TrainingModuleRow,
} from '../../lib/training/quiz-complete-logic';

const TRAINING_MODULES: TrainingModuleRow[] = [
  { id: 'mod-1', course_id: 'course-1', title: 'Pre-Op', order: 1 },
  { id: 'mod-2', course_id: 'course-1', title: 'Eight Point', order: 2 },
  { id: 'mod-3', course_id: 'course-1', title: 'Stability', order: 3 },
  { id: 'mod-4', course_id: 'course-1', title: 'Hazards', order: 4 },
  { id: 'mod-5', course_id: 'course-1', title: 'Shutdown', order: 5 },
];

const ALL_COURSE_MODULES: TrainingModuleRow[] = [
  { id: 'mod-0', course_id: 'course-1', title: 'Introduction', order: 0 },
  ...TRAINING_MODULES,
  { id: 'mod-99', course_id: 'course-1', title: 'Course Completion', order: 99 },
];

test.describe('resolveModuleByIdOrOrder', () => {
  test('resolves module order 1 for mobile moduleId: 1', () => {
    const mod = resolveModuleByIdOrOrder(TRAINING_MODULES, 1);
    expect(mod?.order).toBe(1);
    expect(mod?.id).toBe('mod-1');
  });

  test('resolves by UUID string', () => {
    const mod = resolveModuleByIdOrOrder(TRAINING_MODULES, 'mod-3');
    expect(mod?.order).toBe(3);
  });
});

test.describe('filterTrainingModulesByOrder', () => {
  test('keeps orders 1–5 and ignores intro / completion', () => {
    const filtered = filterTrainingModulesByOrder(ALL_COURSE_MODULES);
    expect(filtered.map((m) => m.order)).toEqual([1, 2, 3, 4, 5]);
    expect(filtered).toHaveLength(5);
  });

  test('empty input → empty output', () => {
    expect(filterTrainingModulesByOrder([])).toEqual([]);
  });
});

test.describe('computeQuizBasedProgressPct', () => {
  test('one passed module → 20%', () => {
    expect(computeQuizBasedProgressPct(5, 1, 0)).toBe(20);
  });

  test('five passed modules → 100%', () => {
    expect(computeQuizBasedProgressPct(5, 5, 0)).toBe(100);
  });

  test('user at 100% — extra module complete does not reduce pct', () => {
    // e.g. 4 distinct modules in attempts → 80%, but enrollment already 100%
    expect(computeQuizBasedProgressPct(5, 4, 100)).toBe(100);
  });

  test('web regression: progress increases with more modules', () => {
    expect(computeQuizBasedProgressPct(5, 2, 20)).toBe(40);
  });
});

test.describe('computeCanTakeExamFromAttempts', () => {
  test('false until all 5 training modules have a passing attempt', () => {
    const moduleIds = TRAINING_MODULES.map((m) => m.id);
    expect(computeCanTakeExamFromAttempts(moduleIds, [])).toBe(false);
    expect(
      computeCanTakeExamFromAttempts(moduleIds, [
        { module_id: 'mod-1', passed: true },
        { module_id: 'mod-2', passed: true },
        { module_id: 'mod-3', passed: true },
        { module_id: 'mod-4', passed: true },
      ]),
    ).toBe(false);
  });

  test('true after 5 module quiz-completes (latest attempt per module)', () => {
    const moduleIds = TRAINING_MODULES.map((m) => m.id);
    const attempts = moduleIds.map((id) => ({ module_id: id, passed: true }));
    expect(computeCanTakeExamFromAttempts(moduleIds, attempts)).toBe(true);
  });

  test('uses most recent attempt per module (failed then passed)', () => {
    const moduleIds = ['mod-1'];
    const attempts = [
      { module_id: 'mod-1', passed: true },
      { module_id: 'mod-1', passed: false },
    ];
    // Map keeps first seen (same as GET progress: descending created_at, first wins)
    expect(computeCanTakeExamFromAttempts(moduleIds, attempts)).toBe(true);
  });
});

test.describe('Bearer auth contract (documentation)', () => {
  test('quiz-complete route imports getAuthUser (cookie OR Bearer)', async () => {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const source = await readFile(
      join(process.cwd(), 'app/api/training/quiz-complete/route.ts'),
      'utf8',
    );
    expect(source).toContain("from '@/lib/supabase/mobile-auth'");
    expect(source).toContain('getAuthUser');
    expect(source).not.toContain('createServerClient');
  });

  test('quiz-complete does not filter modules via PostgREST order= param', async () => {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const source = await readFile(
      join(process.cwd(), 'app/api/training/quiz-complete/route.ts'),
      'utf8',
    );
    expect(source).toContain('filterTrainingModulesByOrder');
    expect(source).not.toContain(".gte('order'");
    expect(source).not.toContain('.gte("order"');
    expect(source).not.toContain(".lte('order'");
    expect(source).not.toContain('.lte("order"');
  });
});
