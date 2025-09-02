import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { paper_id, answers, course_id } = await req.json();
  if (!paper_id || !Array.isArray(answers)) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });

  const store = (global as any).__exam_papers as Map<string, { correct:number[]; ttl:number }> | undefined;
  const paper = store?.get(paper_id);
  if (!paper || paper.ttl < Date.now()) return NextResponse.json({ ok:false, error:'paper_expired' }, { status:400 });

  const correct = paper.correct;
  const total = correct.length;
  const incorrectIndices: number[] = [];
  let got = 0;
  for (let i=0;i<total;i++){
    const a = typeof answers[i] === 'number' ? answers[i] : -1;
    if (a === correct[i]) got++; else incorrectIndices.push(i);
  }
  const scorePct = Math.round((got/total)*100);
  const passed = scorePct >= 80; // default, matches your earlier standard

  // persist attempt (best-effort)
  await svc.from('exam_attempts').insert({ user_id: user.id, course_id: course_id || null, answers, score_pct: scorePct, passed });

  return NextResponse.json({ ok:true, passed, scorePct, correct: got, total, incorrectIndices }, { headers:{ 'Cache-Control':'no-store' } });
}