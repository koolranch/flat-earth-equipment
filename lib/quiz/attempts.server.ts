// lib/quiz/attempts.server.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase/server';

export type StartAttemptInput = { courseId?: string; moduleId?: string; poolIds: string[]; take: number; mode?: 'full'|'retry'; retryIds?: string[] };
export type StartAttemptOutput = { attemptId: string; order: string[] };

export async function startAttempt(input: StartAttemptInput): Promise<StartAttemptOutput> {
  const sb = supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user?.user) throw new Error('Not authenticated');
  const seed = Math.random().toString(36).slice(2);
  const order = (input.mode==='retry' && input.retryIds?.length) ? input.retryIds : shuffle(input.poolIds).slice(0, input.take);
  const { data, error } = await sb.from('quiz_attempts').insert({
    user_id: user.user.id,
    course_id: input.courseId ?? null,
    module_id: input.moduleId ?? null,
    mode: input.mode ?? 'full',
    seed,
    question_ids: order,
    total_count: order.length
  }).select('id').single();
  if (error) throw error;
  return { attemptId: data.id, order };
}

export async function finishAttempt(attemptId: string, correctIds: string[]): Promise<{ score: number; incorrect: string[]; passed: boolean }>{
  const sb = supabaseServer();
  const { data: att, error: e1 } = await sb.from('quiz_attempts').select('question_ids').eq('id', attemptId).maybeSingle();
  if (e1 || !att) throw e1 || new Error('attempt not found');
  const qids: string[] = att.question_ids as any;
  const correct = new Set(correctIds);
  const incorrect = qids.filter(id => !correct.has(id));
  const score = Math.round((correctIds.length / qids.length) * 100);
  const passed = score >= 80; // pass bar
  const { error: e2 } = await sb.from('quiz_attempts').update({
    correct_count: correctIds.length,
    total_count: qids.length,
    incorrect_ids: incorrect,
    score,
    passed
  }).eq('id', attemptId);
  if (e2) throw e2;
  return { score, incorrect, passed };
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(()=>Math.random()-0.5); }
