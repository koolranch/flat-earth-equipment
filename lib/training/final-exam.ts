import { createServerClient } from '@/lib/supabase/server';

async function fetchForkliftModuleSlugs(supabase: ReturnType<typeof createServerClient>) {
  // Collect content_slug for forklift modules (non-null)
  const { data: mods } = await supabase
    .from('modules')
    .select('content_slug')
    .eq('course_id', (
      await supabase.from('courses').select('id').eq('slug', 'forklift').maybeSingle()
    ).data?.id || '');
  const fromModules = (mods || []).map(m => m.content_slug).filter((s): s is string => !!s);
  const baseSet = new Set(fromModules);

  // Include orphan slug(s) detected in your data: 'shutdown-and-parking'
  // Only add if NOT already covered by modules and quiz_items actually uses it.
  const orphanCandidates = ['shutdown-and-parking'];
  const { data: orphanFound } = await supabase
    .from('quiz_items')
    .select('module_slug')
    .in('module_slug', orphanCandidates)
    .limit(10);

  const extras: string[] = [];
  for (const row of orphanFound || []) {
    if (!baseSet.has(row.module_slug)) {
      extras.push(row.module_slug);
      if (process.env.NEXT_PUBLIC_TRAINING_DEBUG === 'true') {
        console.log('[exam] including orphan slug', row.module_slug);
      }
    }
  }
  
  return Array.from(new Set([...fromModules, ...extras]));
}

async function fetchExamSettings(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.from('exam_settings').select('*').limit(1);
  const row = data && data[0];
  return {
    passScore: Number(row?.pass_score ?? 80),
    timeLimitSec: Number(row?.time_limit_min ?? 30) * 60,
    // choose a sensible default length; you can add num_questions to exam_settings later if desired
    numQuestions: 30
  };
}

async function fetchCandidateItems(
  supabase: ReturnType<typeof createServerClient>,
  allowedSlugs: string[]
) {
  if (!allowedSlugs.length) return [] as any[];
  const { data: items } = await supabase
    .from('quiz_items')
    .select('id, module_slug, question, choices, correct_index, explain, tags, active, is_exam_candidate')
    .in('module_slug', allowedSlugs);
  return (items || []).filter(i => (i.active ?? true) && (i.is_exam_candidate ?? false));
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(1, Math.min(n, a.length)));
}

async function insertExamPaperDynamic(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  questionIds: string[],
  correctIndices: number[]
): Promise<{ id: string } | null> {
  // Try common shapes in order. Stop at first success.
  const candidates: Record<string, any>[] = [
    { 
      user_id: userId,
      locale: 'en', 
      item_ids: questionIds, 
      correct_indices: correctIndices,
      ttl_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    { 
      user_id: userId,
      question_ids: questionIds, 
      locale: 'en',
      ttl_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    { 
      user_id: userId,
      questions: questionIds, 
      locale: 'en',
      ttl_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  ];
  
  for (const body of candidates) {
    const { data, error } = await supabase
      .from('exam_papers')
      .insert(body)
      .select('id')
      .single();
    if (!error && data) return data as { id: string };
  }
  return null;
}

export async function getOrCreateFinalExamForUser(userId: string) {
  const supabase = createServerClient();

  // 1) Resume existing session for this user (if any and not completed)
  const { data: existing } = await supabase
    .from('exam_sessions')
    .select('id, status, paper_id, remaining_sec')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (existing && existing.length && existing[0].status !== 'completed') {
    return { ok: true as const, mode: 'resume' as const, session: existing[0] };
  }

  // 2) Build pool of questions
  const allowedSlugs = await fetchForkliftModuleSlugs(supabase);
  const settings = await fetchExamSettings(supabase);
  const pool = await fetchCandidateItems(supabase, allowedSlugs);
  if (!pool.length) return { ok: false as const, reason: 'no-questions' };

  const picked = pickRandom(pool, settings.numQuestions);
  const ids = picked.map(i => i.id);
  const correctIndices = picked.map(i => i.correct_index);

  // 3) Create exam_paper dynamically
  const paper = await insertExamPaperDynamic(supabase, userId, ids, correctIndices);
  if (!paper) return { ok: false as const, reason: 'paper-create-failed' };

  // 4) Create session for this user
  const { data: session, error: sessErr } = await supabase
    .from('exam_sessions')
    .insert({ 
      user_id: userId, 
      paper_id: paper.id, 
      status: 'in_progress', 
      remaining_sec: settings.timeLimitSec 
    })
    .select('id, status, paper_id, remaining_sec')
    .single();
  if (sessErr || !session) return { ok: false as const, reason: 'session-create-failed' };

  return { ok: true as const, mode: 'new' as const, session };
}
