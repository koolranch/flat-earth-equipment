import { createServerClient } from '@/lib/supabase/server';

// We can't import non-exported helpers directly; so add small duplicates here:
function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(1, Math.min(n, a.length)));
}

export async function examPreflight() {
  const supabase = createServerClient();
  
  // modules.content_slug for forklift
  const { data: courseRow } = await supabase.from('courses').select('id').eq('slug', 'forklift').maybeSingle();
  const courseId = courseRow?.id;

  const { data: mods } = await supabase
    .from('modules').select('content_slug').eq('course_id', courseId);
  const moduleSlugs = (mods || []).map(m => m.content_slug).filter(Boolean) as string[];

  // quiz slugs / counts
  const { data: qiAgg } = await supabase
    .from('quiz_items')
    .select('module_slug, active, is_exam_candidate');
  const quizBySlug: Record<string, { total: number; active: number; candidates: number; }> = {};
  for (const r of (qiAgg || [])) {
    const key = r.module_slug as string;
    if (!quizBySlug[key]) quizBySlug[key] = { total: 0, active: 0, candidates: 0 };
    quizBySlug[key].total++;
    if ((r.active ?? true)) quizBySlug[key].active++;
    if ((r.is_exam_candidate ?? false)) quizBySlug[key].candidates++;
  }

  // orphan detection
  const moduleSet = new Set(moduleSlugs);
  const orphanSlugs = Object.keys(quizBySlug).filter(s => !moduleSet.has(s));

  // exam_settings
  const { data: settingsRows } = await supabase.from('exam_settings').select('*').limit(1);
  const s = settingsRows?.[0] || {};
  const passScore = Number(s.pass_score ?? 80);
  const timeLimitMin = Number(s.time_limit_min ?? 30);
  const numQuestions = 30;

  // Build candidate pool (read-only) matching final-exam.ts behavior
  const allowed = Array.from(new Set([...moduleSlugs, ...orphanSlugs]));
  const { data: pool } = await supabase
    .from('quiz_items')
    .select('id, module_slug, active, is_exam_candidate')
    .in('module_slug', allowed);
  const candidates = (pool || []).filter(i => (i.active ?? true) && (i.is_exam_candidate ?? false));
  const picked = pickRandom(candidates, numQuestions);

  return {
    moduleSlugs,
    quizBySlug,
    orphanSlugs,
    settings: { passScore, timeLimitMin, numQuestions },
    counts: {
      modules: moduleSlugs.length,
      quizDistinctSlugs: Object.keys(quizBySlug).length,
      orphanCount: orphanSlugs.length,
      candidatePool: candidates.length,
      willPick: picked.length
    },
    sampleIds: picked.slice(0, 10).map(i => i.id)
  };
}
