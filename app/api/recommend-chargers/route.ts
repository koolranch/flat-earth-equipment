import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { parseSpecsFromSlugSafe, withinPct } from '@/lib/specsDebug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECS_ENABLED = (process.env.RECS_ENABLED ?? process.env.NEXT_PUBLIC_RECS_ENABLED ?? '0') === '1';
const AMP_TOL = Number(process.env.RECS_AMP_TOLERANCE_PCT ?? '15');

const Input = z.object({
  voltage: z.number().int().positive().optional().nullable(),
  amps: z.number().int().positive().optional().nullable(),
  phase: z.enum(['1P','3P']).optional().nullable(),
  chemistry: z.string().optional().nullable(),
  limit: z.number().int().positive().max(50).default(12)
});

function sbServer(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if(!url || !key) throw new Error('Missing Supabase env');
  return createClient(url, key, { auth: { persistSession: false } });
}

function scoreItem(body: z.infer<typeof Input>, row: any){
  const s = parseSpecsFromSlugSafe(row.slug);
  let score = 0; const reasons: {label:string;weight?:number}[] = [];
  const voltMatch = body.voltage ? s.voltage === body.voltage : true;
  const ampClose  = body.amps ? withinPct(body.amps, s.current, AMP_TOL) : true;
  const phaseMatch = body.phase ? (s.phase ? s.phase === body.phase : true) : true;
  if (voltMatch && body.voltage) { score += 100; reasons.push({label:`For your ${body.voltage}V battery`, weight:100}); }
  if (ampClose && body.amps && s.current) { score += 50; reasons.push({label:`Charge speed fit (~${s.current}A)`, weight:50}); }
  if (phaseMatch && body.phase) { score += 20; reasons.push({label: body.phase==='1P'?'Single‑phase compatible':'Three‑phase compatible', weight:20}); }
  const matchType: 'best'|'alternate' = (voltMatch && ampClose && phaseMatch) ? 'best' : 'alternate';
  if (matchType==='best') reasons.unshift({ label:`Best match for your ${s.voltage ?? '?'}V / ~${s.current ?? '?'}A`, weight:120 });
  else reasons.push({ label:'Closest available match' });
  return { score, reasons, matchType, specs: s };
}

export async function GET(){
  return NextResponse.json({ ok:true, enabled: RECS_ENABLED, ampTolerancePct: AMP_TOL });
}

export async function POST(req: NextRequest){
  try{
    if(!RECS_ENABLED) return NextResponse.json({ ok:false, error:'RECS_DISABLED' }, { status:503 });
    let json: unknown; try { json = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
    const body = Input.parse(json);

    const sb = sbServer();
    const { data, error } = await sb
      .from('parts')
      .select('id,name,slug,image_url,price,price_cents,stripe_price_id,sku,category_slug')
      .eq('category_slug','battery-chargers')
      .order('slug', { ascending: true })
      .limit(1000);
    if (error) throw error;

    const items = (data ?? []).map((p:any) => {
      const { score, reasons, matchType, specs } = scoreItem(body, p);
      return { ...p, dc_voltage_v: specs.voltage, dc_current_a: specs.current, input_phase: specs.phase, chemistry_support: ['lead-acid','AGM','gel','lithium'], score, reasons, matchType };
    }).sort((a:any,b:any)=> b.score - a.score).slice(0, body.limit ?? 12);

    return NextResponse.json({ ok:true, items, debug:{ requested: body, count: items.length, ampTolerancePct: AMP_TOL } });
  } catch (err:any) {
    console.error('[recommend-chargers] error', err?.message);
    const hint = (!process.env.NEXT_PUBLIC_SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) ? 'Missing Supabase env vars' : undefined;
    return NextResponse.json({ ok:false, error:'SERVER_ERROR', hint }, { status:500 });
  }
}