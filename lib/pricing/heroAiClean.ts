/**
 * AI cleanup of a stored raw vendor hero. Writes the result as the cleaned
 * candidate only — never sets parts.image_url. Approve stays a human click.
 */

import { generateText } from 'ai';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ALLOWED_HERO_MIME,
  HERO_PENDING_BUCKET,
  heroAiCleanEligibility,
  recordCleaned,
  sniffHeroMime,
  type HeroOpResult,
  type HeroReviewRow,
} from './heroTray';
import type { WatchRow } from './magWatchUniverse';

export const HERO_AI_CLEAN_MODEL = 'google/gemini-3.1-flash-image-preview';

export function buildHeroCleanPrompt(row: WatchRow): string {
  const identity = [row.brand, row.oem_reference, row.name].filter(Boolean).join(' — ');
  return [
    'Clean this industrial-parts product photo for an ecommerce catalog.',
    `The part is: ${identity}.`,
    'Keep the exact same physical part, camera angle, ports, threads, connectors, and proportions.',
    'Remove watermarks, logos, website URLs, price tags, and overlay text.',
    'Place the part on a clean seamless white studio background.',
    'Soft even lighting, sharp, no crop of the part.',
    'Do not add any lettering, brand names, part numbers, labels, or invented markings.',
    'Do not invent a different part or extra accessories.',
  ].join(' ');
}

export async function applyHeroAiClean(
  supabase: SupabaseClient,
  row: WatchRow,
  review: HeroReviewRow
): Promise<HeroOpResult> {
  const gate = heroAiCleanEligibility(row, review);
  if (!gate.ok) return { ok: false, note: gate.why };
  const rawPath = review.raw_path!;

  const { data: file, error: dlErr } = await supabase.storage.from(HERO_PENDING_BUCKET).download(rawPath);
  if (dlErr || !file) return { ok: false, note: `raw download failed: ${dlErr?.message ?? 'empty'}` };

  const rawBytes = new Uint8Array(await file.arrayBuffer());
  const rawMime = sniffHeroMime(rawBytes, file.type) ?? 'image/jpeg';

  const result = await generateText({
    model: HERO_AI_CLEAN_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildHeroCleanPrompt(row) },
          { type: 'file', mediaType: rawMime, data: rawBytes },
        ],
      },
    ],
  });

  const image = result.files.find((f) => f.mediaType?.startsWith('image/'));
  if (!image) return { ok: false, note: 'model returned no image — try again or upload a cleaned file' };

  const bytes = image.uint8Array;
  const mime = sniffHeroMime(bytes, image.mediaType);
  if (!mime || !ALLOWED_HERO_MIME.has(mime)) {
    return { ok: false, note: 'model returned an unsupported image type' };
  }

  await recordCleaned(supabase, row, review, bytes, mime, { note: 'ai_cleaned' });
  return { ok: true, note: 'AI cleaned candidate ready — review it, then Approve' };
}
