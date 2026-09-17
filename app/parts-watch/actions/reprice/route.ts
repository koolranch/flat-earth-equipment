import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSkus,
  redirectWithBanner,
  refuseUnlessAllowed,
  stripeClient,
} from '@/lib/internal/partsWatchActions.server';
import { applyReprice, fetchWatchRowBySku, repriceEligibility } from '@/lib/pricing/magWatchOps';
import { loadSkipOems } from '@/lib/pricing/skipComps.server';

export const dynamic = 'force-dynamic';

/** One click can touch at most this many Stripe prices. */
const MAX_REPRICES_PER_SUBMIT = 25;

/**
 * Realign one or more Buy Now SKUs to the vendor sticker. The form may carry a single `sku`
 * or several `sku` fields (bulk). Each SKU is re-gated server-side from the stored vendor
 * reading — the proposed price shown in the UI is never trusted, it is recomputed here.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  // A per-row Apply button submits `only`; that wins over whatever checkboxes happen to be ticked.
  const only = String(form.get('only') ?? '').trim();
  const skus = readSkus(only ? [only] : form.getAll('sku'));
  if (skus.length === 0) return redirectWithBanner(request, 'error', 'Reprice refused: no valid SKU.');
  if (skus.length > MAX_REPRICES_PER_SUBMIT) {
    return redirectWithBanner(request, 'warn', `Reprice refused: ${skus.length} selected, max ${MAX_REPRICES_PER_SUBMIT} per click.`);
  }

  const supabase = opsSupabase();
  const stripe = stripeClient();
  const skipOems = loadSkipOems();

  const applied: string[] = [];
  const refusedRows: string[] = [];
  const failed: string[] = [];

  for (const sku of skus) {
    try {
      const row = await fetchWatchRowBySku(supabase, sku);
      if (!row) {
        refusedRows.push(`${sku} (not found)`);
        continue;
      }
      const eligibility = repriceEligibility(row, { skipOems });
      if (eligibility.kind !== 'apply') {
        refusedRows.push(`${sku} (${eligibility.why ?? eligibility.kind})`);
        continue;
      }
      const result = await applyReprice(stripe, supabase, eligibility.plan, {
        dryRun: false,
        source: 'dashboard',
        note: skus.length > 1 ? 'bulk realign via dashboard' : 'realign via dashboard',
      });
      if (result.ok) applied.push(`${sku} $${eligibility.plan.ourSell}→$${eligibility.plan.proposedSell}`);
      else failed.push(`${sku} (${result.note.slice(0, 80)})`);
    } catch (e) {
      failed.push(`${sku} (${(e as Error).message.slice(0, 80)})`);
    }
  }

  const parts: string[] = [];
  if (applied.length) parts.push(`Repriced ${applied.length}: ${applied.join(', ')}`);
  if (refusedRows.length) parts.push(`Refused ${refusedRows.length}: ${refusedRows.join('; ')}`);
  if (failed.length) parts.push(`Failed ${failed.length}: ${failed.join('; ')}`);
  if (applied.length) parts.push('Rebuild the Merchant feed to push new prices to Shopping.');

  const kind = failed.length ? 'error' : applied.length ? 'ok' : 'warn';
  return redirectWithBanner(request, kind, parts.join(' — '));
}
