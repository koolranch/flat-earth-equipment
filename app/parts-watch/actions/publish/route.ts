import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  readSkus,
  redirectWithBanner,
  refuseUnlessAllowed,
  stripeClient,
} from '@/lib/internal/partsWatchActions.server';
import {
  fetchWatchRowBySku,
  MAX_PUBLISH_BATCH,
  publishEligibility,
  publishStub,
} from '@/lib/pricing/magWatchOps';
import { loadSkipOems } from '@/lib/pricing/skipComps.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Publish quote-only stubs as Buy Now. Accepts one `sku` (single-row button) or many
 * `skus` checkboxes. The server re-derives each sell price and re-checks the photo +
 * Mag-in-stock gate — the UI is a hint, never authority.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const single = readSku(form);
  const selected = single ? [single] : readSkus(form.getAll('skus'));
  if (selected.length === 0) {
    return redirectWithBanner(request, 'error', 'Publish refused: pick at least one ready SKU.');
  }

  const batch = selected.slice(0, MAX_PUBLISH_BATCH);
  const overflow = selected.length - batch.length;

  try {
    const supabase = opsSupabase();
    const stripe = stripeClient();
    const skipOems = loadSkipOems();
    const published: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];
    let publishedDollars = 0;

    for (const sku of batch) {
      const row = await fetchWatchRowBySku(supabase, sku);
      if (!row) {
        skipped.push(`${sku} (not found)`);
        continue;
      }

      const eligibility = publishEligibility(row, { skipOems });
      if (eligibility.kind === 'needs_photo') {
        skipped.push(`${sku} (needs photo)`);
        continue;
      }
      if (eligibility.kind !== 'ready') {
        skipped.push(`${sku} (${eligibility.why})`);
        continue;
      }

      const result = await publishStub(stripe, supabase, eligibility.plan, {
        dryRun: false,
        source: 'dashboard',
        note: batch.length > 1 ? 'published via dashboard batch' : 'published via dashboard',
      });
      if (result.ok) {
        published.push(sku);
        publishedDollars += eligibility.plan.proposedSell;
      } else {
        failed.push(`${sku}: ${result.note}`);
      }
    }

    const bits = [
      published.length
        ? `Published ${published.length} ($${publishedDollars.toLocaleString('en-US', { maximumFractionDigits: 0 })})`
        : 'Published 0',
      skipped.length ? `skipped ${skipped.length}` : null,
      failed.length ? `failed ${failed.length}` : null,
      overflow > 0 ? `capped at ${MAX_PUBLISH_BATCH}, ${overflow} still waiting` : null,
      published.length > 0 ? 'rebuild Merchant feed if any belong in Shopping' : null,
    ].filter(Boolean);

    const kind = failed.length > 0 ? 'error' : skipped.length > 0 && published.length === 0 ? 'warn' : 'ok';
    const detail = [...skipped, ...failed].slice(0, 3).join('; ');
    const message = detail ? `${bits.join(' · ')} — ${detail}` : bits.join(' · ');
    return redirectWithBanner(request, kind, message);
  } catch (e) {
    return redirectWithBanner(
      request,
      'error',
      `Publish failed: ${(e as Error).message.slice(0, 160)}`
    );
  }
}
