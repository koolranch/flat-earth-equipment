import { NextRequest, NextResponse } from 'next/server';
import type { RecommendInput, RecommendResponse } from '@/types/recommendations';
// If your backend logic already exists elsewhere, import and call it here.
import { supabaseServer } from '@/lib/supabaseServer';
import { parseSpecsFromSlug } from '@/lib/chargers';

// Minimal fallback recommender (replace with your production scorer if already implemented)
function scoreItem(target: RecommendInput, p: any) {
  const s = parseSpecsFromSlug(p.slug);
  let score = 0; const reasons: { label: string; weight?: number }[] = [];
  if (target.voltage && s.voltage === target.voltage) { score += 100; reasons.push({ label: `For your ${s.voltage}V battery`, weight: 100 }); }
  if (target.amps && s.current) {
    const tol = 15; const diffPct = Math.abs((s.current - target.amps) / target.amps) * 100;
    if (diffPct <= tol) { score += 50; reasons.push({ label: `Charge speed fit (~${s.current}A)`, weight: 50 }); }
    else if (s.current > 0) { score += Math.max(0, 30 - diffPct); }
  }
  if (target.phase && s.phase === target.phase) { score += 20; reasons.push({ label: s.phase === '1P' ? 'Single-phase compatible' : 'Three-phase compatible', weight: 20 }); }
  if (p.quick_ship) { score += 10; reasons.push({ label: 'Quick ship available', weight: 10 }); }
  return { score, reasons };
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
      const { score, reasons } = scoreItem(body, p);
      const s = parseSpecsFromSlug(p.slug);
      const fallback = score < 120; // arbitrary threshold for 'best match'
      const matchType: 'best' | 'alternate' = score >= 150 ? 'best' : 'alternate'; // 150+ = best match, 120-149 = alternate, <120 = fallback
      return { 
        ...p, 
        dc_voltage_v: s.voltage, 
        dc_current_a: s.current, 
        input_phase: s.phase === 'unknown' ? null : s.phase, // Convert 'unknown' to null
        chemistry_support: ['lead-acid','AGM','gel','lithium'], 
        score, 
        reasons, 
        fallback,
        matchType
      };
    }).sort((a,b) => b.score - a.score).slice(0, body.limit ?? 6);

    return NextResponse.json({ ok: true, items } satisfies RecommendResponse);
  } catch (e: any) {
    console.error('recommend-chargers error', e);
    return NextResponse.json({ ok: false, error: 'Server error' } satisfies RecommendResponse, { status: 500 });
  }
}
