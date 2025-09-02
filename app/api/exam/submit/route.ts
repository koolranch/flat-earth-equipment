import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { session_id, answers, course_id } = await req.json();
  if (!session_id || !Array.isArray(answers)) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });

  // load session + paper
  const { data: sess } = await svc.from('exam_sessions').select('id, paper_id, status').eq('id', session_id).eq('user_id', user.id).maybeSingle();
  if (!sess || sess.status !== 'in_progress') return NextResponse.json({ ok:false, error:'invalid_session' }, { status:400 });
  const { data: paper } = await svc.from('exam_papers').select('id, correct_indices').eq('id', sess.paper_id).maybeSingle();
  if (!paper) return NextResponse.json({ ok:false, error:'paper_missing' }, { status:400 });

  // settings
  const { data: cfg } = await svc.from('exam_settings').select('pass_score').maybeSingle();
  const passScore = cfg?.pass_score ?? 80;

  const correct = paper.correct_indices as number[];
  const total = correct.length;
  let got = 0; const incorrect: number[] = [];
  for (let i=0;i<total;i++){ const a = typeof answers[i]==='number'? answers[i] : -1; if (a===correct[i]) got++; else incorrect.push(i); }
  const scorePct = Math.round((got/total)*100);
  const passed = scorePct >= passScore;

  // finish session
  await svc.from('exam_sessions').update({ status:'completed' }).eq('id', session_id);
  await svc.from('exam_attempts').insert({ user_id: user.id, course_id: course_id||null, paper_id: sess.paper_id, answers, score_pct: scorePct, passed });

  return NextResponse.json({ ok:true, passed, scorePct, correct: got, total, incorrectIndices: incorrect });
}