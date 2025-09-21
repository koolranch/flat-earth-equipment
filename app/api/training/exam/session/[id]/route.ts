import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const sessionId = params.id;

  // 1) Load the session owned by the current user (RLS + explicit filter)
  const { data: sess, error: sErr } = await supabase
    .from('exam_sessions')
    .select('id, user_id, paper_id, remaining_sec, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (sErr || !sess) return NextResponse.json({ ok: false, reason: 'session-not-found' }, { status: 404 });

  // 2) Load paper (owner is same user via RLS)
  const { data: paper, error: pErr } = await supabase
    .from('exam_papers')
    .select('id, user_id, item_ids, correct_indices, locale, ttl_at')
    .eq('id', sess.paper_id)
    .maybeSingle();
  if (pErr || !paper) return NextResponse.json({ ok: false, reason: 'paper-not-found' }, { status: 404 });

  const ids: string[] = paper.item_ids || [];
  if (!ids.length) return NextResponse.json({ ok: false, reason: 'empty-paper' }, { status: 422 });

  // 3) Fetch questions and preserve original order
  const { data: items, error: qErr } = await supabase
    .from('quiz_items')
    .select('id, question, choices, correct_index, module_slug, active')
    .in('id', ids);
  if (qErr) return NextResponse.json({ ok: false, reason: 'items-query-failed' }, { status: 500 });

  const map = new Map((items || []).map(i => [i.id, i]));
  const ordered = ids.map(id => map.get(id)).filter(Boolean) as any[];
  if (!ordered.length) return NextResponse.json({ ok: false, reason: 'items-missing' }, { status: 422 });

  // Do NOT include correct answers in the client payload
  const questions = ordered.map(i => ({ id: i.id, prompt: i.question, question: i.question, choices: i.choices }));

  return NextResponse.json({
    ok: true,
    session: { id: sess.id, remainingSec: sess.remaining_sec, status: sess.status },
    paper: { id: paper.id, locale: paper.locale, ttlAt: paper.ttl_at },
    counts: { total: ids.length },
    questions
  });
}
