/**
 * Pure helpers for POST /api/training/quiz-complete (web + mobile Bearer).
 */

export type TrainingModuleRow = {
  id: string;
  course_id: string;
  title: string;
  order: number;
  type?: string | null;
};

export function resolveModuleByIdOrOrder(
  modules: TrainingModuleRow[],
  moduleId: string | number,
): TrainingModuleRow | null {
  if (!modules.length) return null;

  const asString = String(moduleId);
  const byUuid = modules.find((m) => m.id === asString);
  if (byUuid) return byUuid;

  const orderNum = Number(moduleId);
  if (!Number.isNaN(orderNum)) {
    return modules.find((m) => m.order === orderNum) ?? null;
  }

  return null;
}

/**
 * Matches quiz-complete enrollment update: Math.round(passedModules / total * 100),
 * never below current progress_pct (protects exam-complete / legacy 100% rows).
 */
export function computeQuizBasedProgressPct(
  totalTrainingModules: number,
  passedDistinctModuleCount: number,
  currentProgressPct: number | null = null,
): number {
  if (totalTrainingModules <= 0) {
    return currentProgressPct ?? 0;
  }
  const computed = Math.round((passedDistinctModuleCount / totalTrainingModules) * 100);
  return Math.max(currentProgressPct ?? 0, computed);
}

/** Mirrors GET /api/training/progress canTakeExam (orders 1–5, latest attempt per module). */
export function computeCanTakeExamFromAttempts(
  trainingModuleIds: string[],
  attempts: Array<{ module_id: string | null; passed: boolean | null }>,
): boolean {
  const completedModules = new Map<string, boolean>();
  for (const attempt of attempts) {
    if (attempt.module_id && !completedModules.has(attempt.module_id)) {
      completedModules.set(attempt.module_id, attempt.passed || false);
    }
  }
  if (trainingModuleIds.length === 0) return false;
  const completedCount = trainingModuleIds.filter((id) => completedModules.get(id)).length;
  return completedCount === trainingModuleIds.length;
}
