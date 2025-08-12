import { NextRequest, NextResponse } from 'next/server';
import type { RecommendInput, RecommendResponse } from '@/types/recommendations';
// If your backend logic already exists elsewhere, import and call it here.
import { supabaseServer } from '@/lib/supabaseServer';
import { parseSpecsFromSlug } from '@/lib/chargers';

// Configurable amp tolerance percentage
const AMP_TOL = Number(process.env.RECS_AMP_TOLERANCE_PCT ?? '12');

// Helper to check if actual value is within tolerance percentage of target
function withinPct(target: number, actual: number, tolPct: number): boolean {
  if (!target || !actual) return false;
  const diffPct = Math.abs((actual - target) / target) * 100;
  return diffPct <= tolPct;
}

// Enhanced recommender with explicit matchType determination
function scoreItem(target: RecommendInput, p: any) {
  const s = parseSpecsFromSlug(p.slug);
  let score = 0; 
  const reasons: { label: string; weight?: number }[] = [];
  
  // Check match criteria
  const voltageMatch = target.voltage ? s.voltage === target.voltage : true;
  const ampClose = target.amps && s.current ? withinPct(target.amps, s.current, AMP_TOL) : true;
  const phaseMatch = target.phase && s.phase ? (target.phase === s.phase) : true; // if user picked 'Not sure', don't penalize
  
  // Determine matchType BEFORE scoring
  let matchType: 'best' | 'alternate' = 'alternate';
  if (voltageMatch && ampClose && phaseMatch) {
    matchType = 'best';
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
    reasons.unshift({ label: `Best match for your ${s.voltage}V / ~${s.current}A`, weight: 120 });
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
      const s = parseSpecsFromSlug(p.slug);
      const fallback = matchType === 'alternate';
      
      // Server-side debug logging
      console.log('[recs]', p.slug, { 
        matchType, 
        score, 
        amp: s.current, 
        reqAmp: body.amps, 
        phase: s.phase, 
        reqPhase: body.phase,
        voltage: s.voltage,
        reqVoltage: body.voltage
      });
      
      return { 
        ...p, 
        dc_voltage_v: s.voltage, 
        dc_current_a: s.current, 
        input_phase: s.phase === 'unknown' ? null : s.phase, // Convert 'unknown' to null
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

    return NextResponse.json({ ok: true, items } satisfies RecommendResponse);
  } catch (e: any) {
    console.error('recommend-chargers error', e);
    return NextResponse.json({ ok: false, error: 'Server error' } satisfies RecommendResponse, { status: 500 });
  }
}
