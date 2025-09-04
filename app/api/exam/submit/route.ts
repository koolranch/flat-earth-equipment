import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { sendMail } from '@/lib/email/mailer';
import { T } from '@/lib/email/templates';

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

  // load item tags for this paper
  const { data: paperFull } = await svc
    .from('exam_papers')
    .select('item_ids')
    .eq('id', sess.paper_id)
    .maybeSingle();
  let weak: {tag:string; missed:number}[] = [];
  if (paperFull?.item_ids?.length){
    const { data: itemsMeta } = await svc
      .from('quiz_items')
      .select('id,tags,module_slug')
      .in('id', paperFull.item_ids as string[]);
    const missedIdx = new Set(incorrect);
    const tagMap = new Map<string, number>();
    const tagToModule = new Map<string, string>();
    if (itemsMeta && itemsMeta.length > 0) {
      for (let idx=0; idx<itemsMeta.length; idx++){
      if (!missedIdx.has(idx)) continue;
      const it = itemsMeta[idx];
      const tags = (it.tags?.length ? it.tags : ['general']);
      for (const tg of tags){ tagMap.set(tg, (tagMap.get(tg)||0)+1); if (!tagToModule.has(tg) && it.module_slug) tagToModule.set(tg, it.module_slug); }
      }
      weak = Array.from(tagMap.entries()).map(([tag, missed])=>({tag, missed})).sort((a,b)=> b.missed-a.missed).slice(0,3);
      const recs = weak.map(w=> ({ tag: w.tag, slug: tagToModule.get(w.tag) || null, href: tagToModule.get(w.tag) ? `/training/modules/${tagToModule.get(w.tag)}` : null }));
      
      // Email hooks (best-effort)
      try {
        const { data: prof } = await svc.from('profiles').select('email,full_name').eq('id', user.id).maybeSingle();
        const email = prof?.email;
        const name = prof?.full_name || 'Operator';
        if (email) {
          const template = passed ? T.exam_pass(name) : T.exam_fail(name);
          await sendMail({ to: email, ...template });
        }
      } catch (err) {
        console.warn('[email] Failed to send exam result email:', err);
      }
      
      return NextResponse.json({ ok:true, passed, scorePct, correct: got, total, incorrectIndices: incorrect, weak_tags: weak, recommendations: recs });
    }
  }
  
  // Email hooks (best-effort) - for case without item metadata
  try {
    const { data: prof } = await svc.from('profiles').select('email,full_name').eq('id', user.id).maybeSingle();
    const email = prof?.email;
    const name = prof?.full_name || 'Operator';
    if (email) {
      const template = passed ? T.exam_pass(name) : T.exam_fail(name);
      await sendMail({ to: email, ...template });
    }
  } catch (err) {
    console.warn('[email] Failed to send exam result email:', err);
  }
  
  return NextResponse.json({ ok:true, passed, scorePct, correct: got, total, incorrectIndices: incorrect, weak_tags: [], recommendations: [] });
}