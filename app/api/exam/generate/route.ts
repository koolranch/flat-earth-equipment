import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { logServerError } from '@/lib/monitor/log.server';
import crypto from 'crypto';

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
  const count = Math.max(1, Math.min(50, Number(body?.count) || 20));
  const locale = (body?.locale === 'es' ? 'es' : 'en');

  // 1) Load active blueprint for locale; fallback to EN; fallback to hardcoded defaults
  const defBp = { count, difficulty_weights: { '1':0.1,'2':0.25,'3':0.4,'4':0.2,'5':0.05 }, tag_targets: { preop:0.2, inspection:0.2, stability:0.25, hazards:0.2, shutdown:0.15 } };
  async function fetchBp(loc: string) {
    const { data } = await svc.from('exam_blueprints').select('*').eq('locale', loc).eq('active', true).maybeSingle();
    return data ? { count: data.count || defBp.count, difficulty_weights: data.difficulty_weights || defBp.difficulty_weights, tag_targets: data.tag_targets || defBp.tag_targets } : null;
  }
  let bp = await fetchBp(locale) || (locale === 'es' ? (await fetchBp('en')) : null) || defBp;
  const need = Math.max(1, Number(bp.count) || count);

  // settings
  const { data: cfg } = await svc.from('exam_settings').select('pass_score, time_limit_min').maybeSingle();
  const passScore = cfg?.pass_score ?? 80;
  const timeLimitMin = cfg?.time_limit_min ?? 30;

  // 2) Fetch candidate pools for locale and EN fallback
  async function fetchPool(loc: string) {
    const { data, error } = await svc
      .from('quiz_items')
      .select('*')
      .eq('locale', loc)
      .eq('is_exam_candidate', true)
      .eq('active', true)
      .eq('status', 'published');
    if (error) throw new Error(error.message);
    return data || [];
  }
  const poolLoc = await fetchPool(locale);
  const poolEN = locale === 'es' ? await fetchPool('en') : [];
  const poolAll = [...poolLoc, ...poolEN.filter(en => !poolLoc.some(l => l.id === en.id))];
  if (!poolAll.length) return NextResponse.json({ ok:false, error:'no_items' }, { status:404 });

  // 3) Weighted sampling by tag_targets and difficulty_weights
  function pickWeighted(list: any[], n: number, tag?: string) {
    const difW = bp.difficulty_weights || {};
    const candidates = list.filter(it => tag ? (Array.isArray(it.tags) && it.tags.includes(tag)) : true);
    if (!candidates.length) return [];
    // score each item by difficulty weight and a small random jitter
    const scored = candidates.map(it => ({ it, score: (difW[String(it.difficulty || 3)] ?? 0.2) * (0.75 + Math.random() * 0.5) }));
    // stable shuffle by hash + score
    scored.sort((a, b) => b.score - a.score);
    const out: any[] = [];
    for (const s of scored) { if (out.length >= n) break; if (!out.find(x => x.id === s.it.id)) out.push(s.it); }
    return out;
  }

  const selections: any[] = [];
  const tagKeys = Object.keys(bp.tag_targets || {});
  for (const t of tagKeys) {
    const share = Math.max(0, Math.floor((bp.tag_targets[t] || 0) * need));
    if (!share) continue;
    const picked = pickWeighted(poolAll, share, t);
    selections.push(...picked);
  }
  // Fill remainder to reach count
  const remaining = need - selections.length;
  if (remaining > 0) {
    const more = pickWeighted(poolAll.filter(it => !selections.some(s => s.id === it.id)), remaining);
    selections.push(...more);
  }
  // final trim and shuffle
  const items = selections.slice(0, need).sort(() => Math.random() - 0.5);

  const item_ids = items.map(i => i.id);
  const correct = items.map(i => i.correct_index);

  // Create paper + session
  const { data: paperRow, error: pErr } = await svc
    .from('exam_papers')
    .insert({ user_id: user.id, locale, item_ids, correct_indices: correct, ttl_at: new Date(Date.now() + timeLimitMin*60*1000) })
    .select('id')
    .maybeSingle();
  if (pErr || !paperRow) {
    await logServerError('exam_generate', 'paper_fail', { error: pErr?.message });
    return NextResponse.json({ ok:false, error: pErr?.message||'paper_fail' }, { status:500 });
  }
  const { data: sess, error: sErr } = await svc
    .from('exam_sessions')
    .insert({ user_id: user.id, paper_id: paperRow.id, answers: new Array(item_ids.length).fill(-1), remaining_sec: timeLimitMin*60, status: 'in_progress' })
    .select('id,remaining_sec')
    .maybeSingle();
  if (sErr || !sess) {
    await logServerError('exam_generate', 'session_fail', { error: sErr?.message, paper_id: paperRow.id });
    return NextResponse.json({ ok:false, error: sErr?.message||'session_fail' }, { status:500 });
  }

  // blueprint echo for analytics/debug
  const blueprint_used = { locale_requested: locale, count: need, difficulty_weights: bp.difficulty_weights, tag_targets: bp.tag_targets };
  const seed = crypto.randomUUID();
  return NextResponse.json({ ok:true, id: paperRow.id, session_id: sess.id, locale, pass_score: passScore, time_limit_sec: timeLimitMin*60, items: items.map(i => ({ id:i.id, question:i.question, choices:i.choices, tags:i.tags||[] })), meta:{ count: item_ids.length, generated_at: new Date().toISOString(), blueprint_used, seed } }, { headers:{ 'Cache-Control':'no-store' } });
}
