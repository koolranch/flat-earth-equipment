export type ModuleKey = 'm1'|'m2'|'m3'|'m4'|'m5';
export type StepKey = 'osha'|'practice'|'flash'|'quiz';

const K = (courseId:string) => `progress:${courseId}`;

export function loadProgress(courseId:string): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(K(courseId)) || '{}'); } catch { return {}; }
}
export function saveProgress(courseId:string, data:Record<string,any>) {
  localStorage.setItem(K(courseId), JSON.stringify(data));
}
export function isStepDone(courseId:string, moduleKey:ModuleKey, step:StepKey) {
  const p = loadProgress(courseId);
  return Boolean(p?.[moduleKey]?.[`${step}Done`]);
}
export async function completeStep(courseId:string, moduleKey:ModuleKey, step:StepKey) {
  // If a server endpoint exists (e.g. POST /api/training/progress), call it here in a try/catch.
  try {
    // @ts-ignore optional
    if (typeof fetch === 'function') {
      await fetch('/api/training/progress', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ courseId, moduleKey, step })
      }).catch(()=>{});
    }
  } catch {}
  const p = loadProgress(courseId);
  p[moduleKey] = { ...(p[moduleKey]||{}), [`${step}Done`]: true, ts: Date.now() };
  saveProgress(courseId, p);
}
