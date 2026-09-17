import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
  stripeClient,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku, pullEligibility, pullSoldOut } from '@/lib/pricing/magWatchOps';

export const dynamic = 'force-dynamic';

/** Take one sold-out Buy Now SKU off sale. Same gate as the CLI; one row per request. */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Pull refused: bad SKU.');

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Pull refused: ${sku} not found.`);

    const eligibility = pullEligibility(row);
    if (!eligibility.ok) {
      return redirectWithBanner(request, 'warn', `Pull refused for ${sku}: ${eligibility.why}`);
    }

    const result = await pullSoldOut(stripeClient(), supabase, eligibility.plan, {
      dryRun: false,
      source: 'dashboard',
    });
    const audit = result.auditError ? ` (audit row failed: ${result.auditError})` : '';
    return redirectWithBanner(
      request,
      result.ok ? 'ok' : 'error',
      `${result.ok ? 'Pulled' : 'Pull failed'} ${sku}: ${result.note}${audit}`
    );
  } catch (e) {
    return redirectWithBanner(request, 'error', `Pull failed for ${sku}: ${(e as Error).message.slice(0, 160)}`);
  }
}
