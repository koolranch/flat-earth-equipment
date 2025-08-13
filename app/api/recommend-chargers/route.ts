import { NextRequest, NextResponse } from 'next/server';
import type { RecommendInput, RecommendResponse } from '@/types/recommendations';
// If your backend logic already exists elsewhere, import and call it here.
import { supabaseServer } from '@/lib/supabaseServer';
import { parseSpecsFromSlugSafe, withinPct } from '@/lib/specsDebug';

// Configurable amp tolerance percentage - widened to 15% to capture 36V 70A vs 75A
const AMP_TOL = Number(process.env.RECS_AMP_TOLERANCE_PCT ?? '15');

// Enhanced recommender with explicit matchType determination
function scoreItem(target: RecommendInput, p: any) {
  const s = parseSpecsFromSlugSafe(p.slug);
  let score = 0; 
  const reasons: { label: string; weight?: number }[] = [];
  
  // Check match criteria - be more explicit about requirements
  const voltageMatch = target.voltage ? s.voltage === target.voltage : true;
  const ampClose = target.amps ? withinPct(target.amps, s.current, AMP_TOL) : true; // if no target amps, don't filter out
  const phaseMatch = target.phase ? (s.phase ? s.phase === target.phase : true) : true; // if user 'Not sure', don't penalize
  
  // Determine matchType BEFORE scoring
  let matchType: 'best' | 'alternate' = 'alternate';
  if (voltageMatch && ampClose && phaseMatch) {
    matchType = 'best';
  }
  if (!s.current && target.amps) { 
    matchType = 'alternate'; // if charger has no current spec and we're looking for specific amps
  }
  
  // Score based on match quality
  if (target.voltage && s.voltage === target.voltage) { 
    score += 100; 
    reasons.push({ label: `For your ${s.voltage}V battery`, weight: 100 }); 
  }
  
  if (target.amps && s.current) {
    if (ampClose) { 
      score += 50; 
      reasons.push({ label: `Charge speed fit (~${s.current}A)`, weight: 50 }); 
    } else if (s.current > 0) { 
      const diffPct = Math.abs((s.current - target.amps) / target.amps) * 100;
      score += Math.max(0, 30 - diffPct); 
    }
  }
  
  if (target.phase && s.phase === target.phase) { 
    score += 20; 
    reasons.push({ label: s.phase === '1P' ? 'Single-phase compatible' : 'Three-phase compatible', weight: 20 }); 
  }
  
  if (p.quick_ship) { 
    score += 10; 
    reasons.push({ label: 'Quick ship available', weight: 10 }); 
  }
  
  // Add best/alternate specific reasoning
  if (matchType === 'best') {
    reasons.unshift({ label: `Best match for your ${s.voltage}V (~${s.current||'?'}A)`, weight: 120 });
  } else {
    reasons.push({ label: 'Closest available match' });
  }
  
  // Debug payload
  const debug = { 
    ampTolerancePct: AMP_TOL, 
    requested: target, 
    parsed: s, 
    phaseMatch, 
    ampClose,
    voltageMatch
  };
  
  return { score, reasons, matchType, debug };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecommendInput;
    const enabled = process.env.RECS_ENABLED ?? process.env.NEXT_PUBLIC_RECS_ENABLED;
    if (!enabled || enabled === '0') return NextResponse.json({ ok: false, error: 'RECS_DISABLED' } satisfies RecommendResponse, { status: 503 });

    const sb = supabaseServer();
    const { data, error } = await sb
      .from('parts')
      .select('id,name,slug,image_url,price,price_cents,stripe_price_id,sku,description,quick_ship')
      .eq('category_slug', 'battery-chargers')
      .order('slug', { ascending: true })
      .limit(1000);
    if (error) throw error;

    const items = (data ?? []).map((p) => {
      const { score, reasons, matchType, debug } = scoreItem(body, p);
      const s = parseSpecsFromSlugSafe(p.slug);
      const fallback = matchType === 'alternate';
      
      // Attach diagnostics so we can see why items fail to be 'best'
      (p as any)._debug = { req: body, got: s, voltMatch: debug.voltageMatch, ampClose: debug.ampClose, phaseMatch: debug.phaseMatch, AMP_TOL };
      
      return { 
        ...p, 
        dc_voltage_v: s.voltage, 
        dc_current_a: s.current, 
        input_phase: s.phase, // Already returns '1P' | '3P' | null
        chemistry_support: ['lead-acid','AGM','gel','lithium'], 
        score, 
        reasons, 
        fallback,
        matchType,
        debug
      };
    }).sort((a,b) => {
      // Sort best matches first, then by score
      if (a.matchType === 'best' && b.matchType === 'alternate') return -1;
      if (a.matchType === 'alternate' && b.matchType === 'best') return 1;
      return b.score - a.score;
    }).slice(0, body.limit ?? 12); // Increased limit to show more options

    // Before returning, optionally log a couple of top candidates for the given request
    console.log('[recs:req]', body);
    items.slice(0,6).forEach(it => console.log('[recs:item]', it.slug, it.matchType, (it as any)._debug));

    return NextResponse.json({ ok: true, items } satisfies RecommendResponse);
  } catch (e: any) {
    console.error('recommend-chargers error', e);
    return NextResponse.json({ ok: false, error: 'Server error' } satisfies RecommendResponse, { status: 500 });
  }
}
