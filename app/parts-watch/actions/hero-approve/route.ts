import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku } from '@/lib/pricing/magWatchOps';
import { applyHeroApprove, fetchHeroReview, heroApproveEligibility } from '@/lib/pricing/heroTray';

export const dynamic = 'force-dynamic';

/** Copy a cleaned hero to the public bucket and set `parts.image_url`. */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Approve refused: bad SKU.');

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Approve refused: ${sku} not found.`);

    const review = await fetchHeroReview(supabase, sku);
    const gate = heroApproveEligibility(row, review);
    if (!gate.ok) return redirectWithBanner(request, 'warn', `Approve refused for ${sku}: ${gate.why}`);

    const result = await applyHeroApprove(supabase, row, review!, {
      source: 'dashboard',
      note: 'approved via dashboard',
    });
    const audit = result.auditError ? ` (audit row failed: ${result.auditError})` : '';
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'Approved' : 'Approve failed'} ${sku}: ${result.note}${audit}`
    );
  } catch (e) {
    return redirectWithBanner(
      request,
      'error',
      `Approve failed for ${sku}: ${(e as Error).message.slice(0, 160)}`
    );
  }
}
