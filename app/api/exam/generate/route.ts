import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { locale='en', count=20 } = await req.json().catch(()=>({}));

  // Prefer requested locale, fallback
  const tryLocales: ('en'|'es')[] = (locale==='es'? ['es','en'] : ['en','es']);
  let items:any[] = [];
  for (const loc of tryLocales){
    const { data } = await svc
      .from('quiz_items')
      .select('id,question,choices,correct_index')
      .eq('locale', loc)
      .eq('is_exam_candidate', true)
      .eq('active', true)
      .order('difficulty', { ascending: true, nullsFirst: true });
    if (data && data.length){ items = data; break; }
  }
  if (!items.length) return NextResponse.json({ ok:false, error:'no_items' }, { status:400 });

  // Shuffle and slice
  const shuffled = items.sort(()=> Math.random() - 0.5).slice(0, Math.min(count, items.length));

  // Create a paper id and cache correct indices server-side (ephemeral in KV-like memory for now)
  const paper_id = crypto.randomUUID();
  (global as any).__exam_papers = (global as any).__exam_papers || new Map();
  (global as any).__exam_papers.set(paper_id, { correct: shuffled.map(i=> i.correct_index), ttl: Date.now()+60*60*1000 });

  return NextResponse.json({ ok:true, id: paper_id, locale, items: shuffled.map(i=> ({ id:i.id, question:i.question, choices:i.choices })), meta:{ count: shuffled.length } }, { headers:{ 'Cache-Control':'no-store' } });
}
