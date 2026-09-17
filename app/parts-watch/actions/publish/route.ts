import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
  stripeClient,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku, publishEligibility, publishStub } from '@/lib/pricing/magWatchOps';
import { loadSkipOems } from '@/lib/pricing/skipComps.server';

export const dynamic = 'force-dynamic';

/**
 * Publish a quote-only stub as Buy Now. One SKU per click; the server re-derives the sell
 * price from the stored vendor read and refuses anything without a real product photo —
 * the button in the UI is a hint, never authority.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Publish refused: bad SKU.');

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Publish refused: ${sku} not found.`);

    const eligibility = publishEligibility(row, { skipOems: loadSkipOems() });
    if (eligibility.kind === 'needs_photo') {
      return redirectWithBanner(request, 'warn', `Publish refused for ${sku}: needs a real product photo first.`);
    }
    if (eligibility.kind !== 'ready') {
      return redirectWithBanner(request, 'warn', `Publish refused for ${sku}: ${eligibility.why}`);
    }

    const result = await publishStub(stripeClient(), supabase, eligibility.plan, {
      dryRun: false,
      source: 'dashboard',
      note: 'published via dashboard',
    });
    const audit = result.auditError ? ` (audit row failed: ${result.auditError})` : '';
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'Published' : 'Publish failed'} ${sku}: ${result.note}${audit} — rebuild the Merchant feed if this SKU belongs in Shopping.`
    );
  } catch (e) {
    return redirectWithBanner(request, 'error', `Publish failed for ${sku}: ${(e as Error).message.slice(0, 160)}`);
  }
}
