export function markQuizPassedLocal(course: string, mod: string) {
  const k = `progress:${course}`;
  const cur = JSON.parse(localStorage.getItem(k) || "{}");
  cur[mod] = { ...(cur[mod]||{}), quizPassed: true, ts: Date.now() };
  localStorage.setItem(k, JSON.stringify(cur));
}
