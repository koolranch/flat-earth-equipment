export type ModuleStatus = 'locked' | 'in_progress' | 'complete';

export interface ModuleTab { id: string; done?: boolean | null }
export interface CourseModule { id: string; title?: string; status?: ModuleStatus; tabs?: ModuleTab[]; quiz_passed?: boolean }

export function isModuleComplete(m: CourseModule): boolean {
  if (!m) return false;
  if (m.status) return m.status === 'complete';
  if (typeof m.quiz_passed === 'boolean') return m.quiz_passed;
  if (Array.isArray(m.tabs) && m.tabs.length) return m.tabs.every(t => !!t?.done);
  return false;
}

export function computeCourseProgress(modules: CourseModule[] | undefined) {
  const total = Array.isArray(modules) ? modules.length : 0;
  const completed = total ? modules!.filter(isModuleComplete).length : 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
