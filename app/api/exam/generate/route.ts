import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bucket<T>(arr:T[], fn:(x:T)=>string){ const map = new Map<string,T[]>(); for(const x of arr){ const k = fn(x); if(!map.has(k)) map.set(k,[]); map.get(k)!.push(x); } return map; }
function sample<T>(arr:T[], n:number){ const a=[...arr]; const out:T[]=[]; while(out.length<Math.min(n,a.length)){ out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]); } return out; }
function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max,n)); }

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const body = await req.json().catch(()=>({}));
  const locale = (body.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en') as 'en'|'es';
  const count = clamp(Number(body.count||24), 10, 40);

  // settings
  const { data: cfg } = await svc.from('exam_settings').select('pass_score, time_limit_min').maybeSingle();
  const passScore = cfg?.pass_score ?? 80;
  const timeLimitMin = cfg?.time_limit_min ?? 30;

  // pool by locale + fallback
  const locales: ('en'|'es')[] = locale==='es' ? ['es','en'] : ['en','es'];
  let pool:any[] = [];
  for (const loc of locales){
    const { data } = await svc.from('quiz_items')
      .select('id,question,choices,correct_index,tags,difficulty')
      .eq('locale', loc)
      .eq('is_exam_candidate', true)
      .eq('active', true);
    if (data?.length){ pool = data; break; }
  }
  if (!pool.length) return NextResponse.json({ ok:false, error:'no_items' }, { status:400 });

  // Difficulty mix
  const easy = pool.filter(i=> (i.difficulty??3) <= 2);
  const med  = pool.filter(i=> (i.difficulty??3) === 3);
  const hard = pool.filter(i=> (i.difficulty??3) >= 4);
  const nEasy = Math.round(count*0.2);
  const nHard = Math.round(count*0.2);
  const nMed  = count - nEasy - nHard;
  let chosen = [
    ...sample(easy, nEasy),
    ...sample(med,  nMed),
    ...sample(hard, nHard)
  ];

  // Tag balance cap: no more than 40% same tag
  const tagCount = new Map<string,number>();
  const cap = Math.floor(count*0.4);
  const ensureTagBalance = ()=>{
    const out:any[] = [];
    tagCount.clear();
    for (const it of chosen){
      const tags = (it.tags?.length ? it.tags : ['__untagged']) as string[];
      const tag = tags[0];
      const used = tagCount.get(tag)||0;
      if (used < cap){ out.push(it); tagCount.set(tag, used+1); }
    }
    return out;
  };
  chosen = ensureTagBalance();
  // If we lost too many to the cap, top-up with under-represented tags
  if (chosen.length < count){
    const byTag = bucket(pool, i=> (i.tags?.[0] || '__untagged'));
    for (const [tg, arr] of byTag){
      while ((tagCount.get(tg)||0) < cap && chosen.length < count && arr.length){
        const pick = arr.splice(Math.floor(Math.random()*arr.length),1)[0];
        if (!chosen.find(x=> x.id===pick.id)) { chosen.push(pick); tagCount.set(tg,(tagCount.get(tg)||0)+1); }
      }
      if (chosen.length>=count) break;
    }
  }
  chosen = chosen.slice(0, count);

  const item_ids = chosen.map(i=> i.id);
  const correct = chosen.map(i=> i.correct_index);

  // Create paper + session
  const { data: paperRow, error: pErr } = await svc
    .from('exam_papers')
    .insert({ user_id: user.id, locale, item_ids, correct_indices: correct, ttl_at: new Date(Date.now() + timeLimitMin*60*1000) })
    .select('id')
    .maybeSingle();
  if (pErr || !paperRow) return NextResponse.json({ ok:false, error: pErr?.message||'paper_fail' }, { status:500 });
  const { data: sess, error: sErr } = await svc
    .from('exam_sessions')
    .insert({ user_id: user.id, paper_id: paperRow.id, answers: new Array(item_ids.length).fill(-1), remaining_sec: timeLimitMin*60, status: 'in_progress' })
    .select('id,remaining_sec')
    .maybeSingle();
  if (sErr || !sess) return NextResponse.json({ ok:false, error: sErr?.message||'session_fail' }, { status:500 });

  return NextResponse.json({ ok:true, id: paperRow.id, session_id: sess.id, locale, pass_score: passScore, time_limit_sec: timeLimitMin*60, items: chosen.map(i=> ({ id:i.id, question:i.question, choices:i.choices, tags:i.tags||[] })), meta:{ count: item_ids.length } }, { headers:{ 'Cache-Control':'no-store' } });
}
