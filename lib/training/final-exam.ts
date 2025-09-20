import { createServerClient } from '@/lib/supabase/server';

async function fetchForkliftModuleSlugs(supabase: ReturnType<typeof createServerClient>) {
  const { data: courseRow } = await supabase.from('courses').select('id').eq('slug', 'forklift').maybeSingle();
  const courseId = courseRow?.id;
  const { data: mods } = await supabase.from('modules').select('content_slug').eq('course_id', courseId);
  const slugs = (mods || []).map(m => m.content_slug).filter(Boolean) as string[];
  // orphan protection no longer needed if Module 5 slug fixed; keep as fallback
  const orphan = 'shutdown-and-parking';
  if (!slugs.includes(orphan)) {
    const { data: exists } = await supabase.from('quiz_items').select('id').eq('module_slug', orphan).limit(1);
    if (exists && exists.length) slugs.push(orphan);
  }
  return Array.from(new Set(slugs));
}

async function fetchExamSettings(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.from('exam_settings').select('*').limit(1);
  const row = data?.[0] || {};
  return {
    passScore: Number(row.pass_score ?? 80),
    timeLimitSec: Number(row.time_limit_min ?? 30) * 60,
    numQuestions: 30
  };
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(1, Math.min(n, a.length)));
}

export async function getOrCreateFinalExamForUser(userId: string) {
  const supabase = createServerClient();

  // 1) Resume
  const { data: existing } = await supabase
    .from('exam_sessions')
    .select('id, status, paper_id, remaining_sec')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (existing && existing.length && existing[0].status !== 'completed') {
    return { ok: true as const, mode: 'resume' as const, session: existing[0] };
  }

  // 2) Pool
  const [slugs, settings] = await Promise.all([
    fetchForkliftModuleSlugs(supabase),
    fetchExamSettings(supabase)
  ]);
  const { data: pool } = await supabase
    .from('quiz_items')
    .select('id, correct_index, active, is_exam_candidate, module_slug')
    .in('module_slug', slugs);
  const candidates = (pool || []).filter(i => (i.active ?? true) && (i.is_exam_candidate ?? false));
  if (!candidates.length) return { ok: false as const, reason: 'no-questions' };

  const picked = pickRandom(candidates, settings.numQuestions);
  const itemIds = picked.map(i => i.id);
  const correctIndices = picked.map(i => Number(i.correct_index ?? 0));

  // 3) Create paper with required columns
  const ttl = new Date(Date.now() + (settings.timeLimitSec + 300) * 1000).toISOString(); // +5 min cushion
  const { data: paper, error: paperErr } = await supabase
    .from('exam_papers')
    .insert({
      user_id: userId,
      item_ids: itemIds,
      correct_indices: correctIndices,
      locale: 'en',
      ttl_at: ttl
    })
    .select('id')
    .single();
  if (paperErr || !paper) return { ok: false as const, reason: 'paper-create-failed' };

  // 4) Create session
  const { data: session, error: sessErr } = await supabase
    .from('exam_sessions')
    .insert({ user_id: userId, paper_id: paper.id, status: 'in_progress', remaining_sec: settings.timeLimitSec })
    .select('id, status, paper_id, remaining_sec')
    .single();
  if (sessErr || !session) return { ok: false as const, reason: 'session-create-failed' };

  return { ok: true as const, mode: 'new' as const, session };
}
