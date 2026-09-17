import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
  stripeClient,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku, relist, relistEligibility } from '@/lib/pricing/magWatchOps';

export const dynamic = 'force-dynamic';

/**
 * Put a pulled SKU back on Buy Now. Vendor on-hand is a reference, not our stock flag, so
 * the operator must affirm real stock with the `stock_confirmed` checkbox; that affirmation
 * is what the process has always required, and it is recorded in the audit note.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Relist refused: bad SKU.');

  if (form.get('stock_confirmed') !== 'on') {
    return redirectWithBanner(request, 'warn', `Relist refused for ${sku}: confirm vendor stock first.`);
  }

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Relist refused: ${sku} not found.`);

    const eligibility = relistEligibility(row);
    if (!eligibility.ok) {
      return redirectWithBanner(request, 'warn', `Relist refused for ${sku}: ${eligibility.why}`);
    }

    const result = await relist(stripeClient(), supabase, row, {
      dryRun: false,
      source: 'dashboard',
      note: 'stock confirmed by operator via dashboard',
    });
    const audit = result.auditError ? ` (audit row failed: ${result.auditError})` : '';
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'Relisted' : 'Relist failed'} ${sku}: ${result.note}${audit} — rebuild the Merchant feed if this SKU belongs in Shopping.`
    );
  } catch (e) {
    return redirectWithBanner(request, 'error', `Relist failed for ${sku}: ${(e as Error).message.slice(0, 160)}`);
  }
}
