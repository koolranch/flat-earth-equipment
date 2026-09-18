import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku } from '@/lib/pricing/magWatchOps';
import { applyHeroAiClean } from '@/lib/pricing/heroAiClean';
import { fetchHeroReview, heroAiCleanEligibility } from '@/lib/pricing/heroTray';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Rewrite the private cleaned candidate from the stored raw vendor hero.
 * Does not set parts.image_url — that is Approve.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'AI clean refused: bad SKU.');

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `AI clean refused: ${sku} not found.`);

    const review = await fetchHeroReview(supabase, sku);
    const gate = heroAiCleanEligibility(row, review);
    if (!gate.ok) return redirectWithBanner(request, 'warn', `AI clean refused for ${sku}: ${gate.why}`);

    const result = await applyHeroAiClean(supabase, row, review!);
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'AI cleaned' : 'AI clean failed'} ${sku}: ${result.note}`
    );
  } catch (e) {
    return redirectWithBanner(
      request,
      'error',
      `AI clean failed for ${sku}: ${(e as Error).message.slice(0, 160)}`
    );
  }
}
