import { type NextRequest } from 'next/server';
import {
  opsSupabase,
  readSku,
  redirectWithBanner,
  refuseUnlessAllowed,
} from '@/lib/internal/partsWatchActions.server';
import { fetchWatchRowBySku } from '@/lib/pricing/magWatchOps';
import {
  ALLOWED_HERO_MIME,
  fetchHeroReview,
  heroUploadEligibility,
  MAX_HERO_BYTES,
  recordCleaned,
  sniffHeroMime,
} from '@/lib/pricing/heroTray';

export const dynamic = 'force-dynamic';

/**
 * Operator uploads a watermark-free cleaned hero into the private tray.
 * Does not set `parts.image_url` — that is Approve.
 */
export async function POST(request: NextRequest) {
  const refused = refuseUnlessAllowed(request);
  if (refused) return refused;

  const form = await request.formData();
  const sku = readSku(form);
  if (!sku) return redirectWithBanner(request, 'error', 'Upload refused: bad SKU.');

  const file = form.get('cleaned');
  if (!(file instanceof File) || file.size === 0) {
    return redirectWithBanner(request, 'error', `Upload refused for ${sku}: choose a cleaned image.`);
  }
  if (file.size > MAX_HERO_BYTES) {
    return redirectWithBanner(request, 'error', `Upload refused for ${sku}: image larger than 10 MB.`);
  }

  try {
    const supabase = opsSupabase();
    const row = await fetchWatchRowBySku(supabase, sku);
    if (!row) return redirectWithBanner(request, 'error', `Upload refused: ${sku} not found.`);

    const review = await fetchHeroReview(supabase, sku);
    const gate = heroUploadEligibility(row, review);
    if (!gate.ok) return redirectWithBanner(request, 'warn', `Upload refused for ${sku}: ${gate.why}`);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffHeroMime(bytes, file.type);
    if (!mime || !ALLOWED_HERO_MIME.has(mime)) {
      return redirectWithBanner(request, 'error', `Upload refused for ${sku}: use JPEG, PNG, or WebP.`);
    }

    await recordCleaned(supabase, row, review!, bytes, mime);
    return redirectWithBanner(request, 'ok', `Cleaned photo uploaded for ${sku}. Review it, then Approve.`);
  } catch (e) {
    return redirectWithBanner(
      request,
      'error',
      `Upload failed for ${sku}: ${(e as Error).message.slice(0, 160)}`
    );
  }
}
