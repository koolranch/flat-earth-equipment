import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku } from '@/lib/pricing/magWatchOps';
import { applyHeroReject, fetchHeroReview, heroRejectEligibility } from '@/lib/pricing/heroTray';

export const dynamic = 'force-dynamic';

/** Leave `parts.image_url` alone. The raw stays in the private bucket for a later re-intake. */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Reject refused: bad SKU.');

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Reject refused: ${sku} not found.`);

    const review = await fetchHeroReview(supabase, sku);
    const gate = heroRejectEligibility(review);
    if (!gate.ok) return redirectWithBanner(request, 'warn', `Reject refused for ${sku}: ${gate.why}`);

    const result = await applyHeroReject(supabase, row, review!, {
      source: 'dashboard',
      note: 'rejected via dashboard',
    });
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'Rejected' : 'Reject failed'} ${sku}: ${result.note}`
    );
  } catch (e) {
    return redirectWithBanner(
      request,
      'error',
      `Reject failed for ${sku}: ${(e as Error).message.slice(0, 160)}`
    );
  }
}
