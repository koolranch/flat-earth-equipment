// Stub file for progress utilities
export function calculateProgress(completed: string[], total: number): number {
  return Math.round((completed.length / total) * 100);
}

export function getNextModule(currentModule: number, completed: string[]): number | null {
  const nextModule = currentModule + 1;
  return nextModule <= 5 ? nextModule : null;
}

export function getForkliftCourseId(): string {
  return 'forklift';
}

export function getForkliftModuleSlugs(): string[] {
  return ['intro', 'inspection', 'safety', 'hazards', 'operations'];
}

export function computePercentFractional(completed: number, total: number): number {
  return total > 0 ? completed / total : 0;
}

export function resolveCourseForUser(userId: string): Promise<string> {
  return Promise.resolve('forklift');
}

export function getModuleSlugsForCourse(courseId: string): string[] {
  return ['intro', 'inspection', 'safety', 'hazards', 'operations'];
}
