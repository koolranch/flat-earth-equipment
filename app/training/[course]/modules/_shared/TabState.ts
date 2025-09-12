// If this file doesn't exist, skip. Otherwise ensure we store/read 'osha' completion.
export function setOshaDone(moduleId: string) {
  try { localStorage.setItem(`osha:${moduleId}:done`, '1'); } catch {}
}
export function isOshaDone(moduleId: string) {
  try { return localStorage.getItem(`osha:${moduleId}:done`) === '1'; } catch {};
  return false;
}
