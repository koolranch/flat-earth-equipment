import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseService } from '@/lib/supabase/service.server';
import { parseSpecsFromSlugSafe, withinPct } from '../../../lib/specsDebug';
import { filterGreen } from '../../../lib/greenFilter';
import { parseFromText, withinPct as withinPctStruct } from '../../../lib/specsStruct';
import { isGreenViewEnabled } from '../../../lib/greenView';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECS_ENABLED = (process.env.RECS_ENABLED ?? process.env.NEXT_PUBLIC_RECS_ENABLED ?? '0') === '1';
const AMP_TOL = Number(process.env.RECS_AMP_TOLERANCE_PCT ?? '25'); // Increased from 15% to 25% for better matches

const Input = z.object({
  voltage: z.number().int().positive().optional().nullable(),
  amps: z.number().int().positive().optional().nullable(),
  phase: z.enum(['1P','3P']).optional().nullable(),
  chemistry: z.string().optional().nullable(),
  limit: z.number().int().positive().max(50).default(12)
});

function sbServer(){
  return supabaseService();
}

function scoreItem(body: z.infer<typeof Input>, row: any){
  // Phase 2: Prefer structured fields; fallback to parsing only if needed
  const v = row.voltage ?? null; 
  const a = row.amperage ?? null; 
  const ph = row.phase ?? null;
  const parsed = (v && a) ? null : parseFromText(row.slug, row.name, row.description);
  const specs = { 
    voltage: v ?? parsed?.voltage ?? null, 
    current: a ?? parsed?.amperage ?? null, 
    phase: ph ?? parsed?.phase ?? null 
  };
  
  let score = 0; const reasons: {label:string;weight?:number}[] = [];
  const voltMatch = body.voltage ? specs.voltage === body.voltage : true;
  // Use higher tolerance for 3-phase chargers since they're typically higher amperage
  const tolerance = (body.phase === '3P') ? Math.max(AMP_TOL, 40) : AMP_TOL;
  const ampClose  = body.amps ? withinPctStruct(body.amps, specs.current, tolerance) : true;
  const phaseMatch = body.phase ? (specs.phase ? specs.phase === body.phase : true) : true;
  
  if (voltMatch && body.voltage) { score += 100; reasons.push({label:`For your ${body.voltage}V battery`, weight:100}); }
  if (ampClose && body.amps && specs.current) { score += 50; reasons.push({label:`Charge speed fit (~${specs.current}A)`, weight:50}); }
  if (phaseMatch && body.phase) { score += 20; reasons.push({label: body.phase==='1P'?'Single‑phase compatible':'Three‑phase compatible', weight:20}); }
  
  const matchType: 'best'|'alternate' = (voltMatch && ampClose && phaseMatch) ? 'best' : 'alternate';
  if (matchType==='best') reasons.unshift({ label:`Best match for your ${specs.voltage ?? '?'}V / ~${specs.current ?? '?'}A`, weight:120 });
  else reasons.push({ label:'Closest available match' });
  
  return { score, reasons, matchType, specs };
}

export async function GET(){
  const usingGreenView = isGreenViewEnabled();
  const dataSource = usingGreenView ? 'green_chargers' : 'parts';
  return NextResponse.json({
    ok: true,
    enabled: RECS_ENABLED,
    ampTolerancePct: AMP_TOL,
    dataSource,
    usingGreenView
  });
}

export async function POST(req: NextRequest){
  try {
    if(!RECS_ENABLED) return NextResponse.json({ ok:false, error:'RECS_DISABLED' }, { status:503 });
    let json: unknown; try { json = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
    const body = Input.parse(json);

    const sb = sbServer();
    const usingGreenView = isGreenViewEnabled();
    const FROM = usingGreenView ? 'green_chargers' : 'parts';
    const SELECT = 'id, name, slug, image_url, price, price_cents, stripe_price_id, sku, brand, description, voltage, amperage, phase';
    
    let query = sb.from(FROM).select(SELECT);
    
    if (!usingGreenView) {
      // When using parts table, need to filter for battery chargers and GREEN products
      query = query.eq('category_slug', 'battery-chargers');
    }
    
    const { data, error } = await query
      .order('slug', { ascending: true })
      .limit(1000);
      
    if (error) throw error;

    // When using GREEN view, data is already filtered. When using parts, apply additional filtering
    const greenOnlyParts = usingGreenView ? (data ?? []) : filterGreen(data ?? []);

    // Lightweight monitoring: log if any item lacks structured specs (should not happen now)
    (data ?? []).forEach((p: any) => {
      if (p.slug?.startsWith('green') && (!p.voltage || !p.amperage || !p.phase)) {
        console.warn('[recs] missing_struct', p.slug, { v: p.voltage, a: p.amperage, p: p.phase });
      }
    });

    const items = greenOnlyParts.map((p:any) => {
      const { score, reasons, matchType, specs } = scoreItem(body, p);
      return { 
        ...p, 
        dc_voltage_v: specs.voltage, 
        dc_current_a: specs.current, 
        input_phase: specs.phase, 
        chemistry_support: ['lead-acid','AGM','gel','lithium'], 
        score, 
        reasons, 
        matchType 
      };
    }).sort((a:any,b:any)=> b.score - a.score).slice(0, body.limit ?? 12);

    // Separate best matches from alternatives
    const bestMatches = items.filter((item: any) => item.matchType === 'best');
    const alternatives = items.filter((item: any) => item.matchType === 'alternate');
    
    // Identify top pick from best matches (highest scoring)
    const topPick = bestMatches.length > 0 ? { ...bestMatches[0], isTopPick: true } : null;
    const otherBestMatches = bestMatches.slice(1);

    return NextResponse.json({ 
      ok: true, 
      items, // Keep for backward compatibility
      topPick,
      otherBestMatches,
      alternatives,
      debug: { 
        requested: body, 
        count: items.length,
        bestMatchCount: bestMatches.length,
        alternativeCount: alternatives.length,
        ampTolerancePct: AMP_TOL,
        dataSource: FROM,
        usingGreenView,
        rawCount: greenOnlyParts.length
      } 
    });
  } catch (err:any) {
    console.error('[recommend-chargers] error', err?.message);
    // Note: Supabase connection validated through service helper, no direct env check needed
    return NextResponse.json({ ok:false, error:'SERVER_ERROR' }, { status:500 });
  }
}