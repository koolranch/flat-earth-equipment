import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pickBalanced(items: any[], count: number){
  // naive tag-balanced sampler: round-robin across tags
  const byTag = new Map<string, any[]>();
  for (const it of items){
    const tags = (it.tags||['__untagged']);
    for (const tg of tags){ if (!byTag.has(tg)) byTag.set(tg, []); byTag.get(tg)!.push(it); }
  }
  const tagList = Array.from(byTag.keys());
  const chosen: any[] = [];
  let i = 0;
  while (chosen.length < Math.min(count, items.length)){
    const tag = tagList[i % tagList.length];
    const bucket = byTag.get(tag)!;
    if (bucket.length){ chosen.push(bucket.splice(Math.floor(Math.random()*bucket.length),1)[0]); }
    i++;
  }
  return chosen;
}

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const locale = (body.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en') as 'en'|'es';
  const requestedCount = Number(body.count||20);
  const courseId = body.course_id || null;

  // settings
  const { data: cfg } = await svc.from('exam_settings').select('pass_score, time_limit_min').maybeSingle();
  const passScore = cfg?.pass_score ?? 80;
  const timeLimitMin = cfg?.time_limit_min ?? 30;

  // pool (locale + fallback)
  const tryLocales: ('en'|'es')[] = (locale==='es'? ['es','en'] : ['en','es']);
  let pool:any[] = [];
  for (const loc of tryLocales){
    const { data } = await svc
      .from('quiz_items')
      .select('id,question,choices,correct_index,tags')
      .eq('locale', loc)
      .eq('is_exam_candidate', true)
      .eq('active', true);
    if (data?.length){ pool = data; break; }
  }
  if (!pool.length) return NextResponse.json({ ok:false, error:'no_items' }, { status:400 });

  const chosen = pickBalanced(pool, requestedCount);
  const item_ids = chosen.map(i=> i.id);
  const correct = chosen.map(i=> i.correct_index);

  // persist paper
  const { data: paperRow, error: pErr } = await svc
    .from('exam_papers')
    .insert({ user_id: user.id, course_id: courseId, locale, item_ids, correct_indices: correct, ttl_at: new Date(Date.now() + timeLimitMin*60*1000) })
    .select('id')
    .maybeSingle();
  if (pErr || !paperRow) return NextResponse.json({ ok:false, error: pErr?.message||'paper_fail' }, { status:500 });

  // start session
  const { data: sess, error: sErr } = await svc
    .from('exam_sessions')
    .insert({ user_id: user.id, paper_id: paperRow.id, answers: new Array(item_ids.length).fill(-1), remaining_sec: timeLimitMin*60, status: 'in_progress' })
    .select('id,remaining_sec')
    .maybeSingle();
  if (sErr || !sess) return NextResponse.json({ ok:false, error: sErr?.message||'session_fail' }, { status:500 });

  return NextResponse.json({ ok:true, id: paperRow.id, session_id: sess.id, locale, pass_score: passScore, time_limit_sec: timeLimitMin*60, items: chosen.map(i=> ({ id:i.id, question:i.question, choices:i.choices })), meta:{ count: item_ids.length } }, { headers:{ 'Cache-Control':'no-store' } });
}
