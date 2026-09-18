/**
 * Pull identity-ok Magnasource og:images into the private image tray.
 *
 * Downloads the vendor hero at scrape time (the `?key=` expires) and stores
 * bytes in `part-hero-pending`. Never writes `parts.image_url`.
 *
 *   npx tsx scripts/pricing/mag-hero-intake.ts --dry-run
 *   npx tsx scripts/pricing/mag-hero-intake.ts --min-sticker=150 --limit=40
 *   npx tsx scripts/pricing/mag-hero-intake.ts --skus=333D2714,320A6064
 */

import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { heroCandidateFromOgImage } from '../../lib/pricing/magHero';
import { fetchHeroReview, recordIntake, sniffHeroMime, trayIntakeEligibility } from '../../lib/pricing/heroTray';
import { parseMagSnapshot } from '../../lib/pricing/magSnapshot';
import {
  classifyRow,
  isSkip,
  WATCH_ROW_SELECT,
  type WatchCandidate,
  type WatchRow,
} from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CONCURRENCY = 2;
const BASE_DELAY_MS = 1500;
const JITTER_MS = 1500;

type Args = {
  dryRun: boolean;
  limit: number | null;
  minSticker: number;
  skus: string[] | null;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | null => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : null;
  };
  const limitRaw = get('limit');
  const stickerRaw = get('min-sticker');
  const skusRaw = get('skus');
  return {
    dryRun: argv.includes('--dry-run'),
    limit: limitRaw ? Number(limitRaw) : null,
    minSticker: stickerRaw ? Number(stickerRaw) : 0,
    skus: skusRaw ? skusRaw.split(',').map((s) => s.trim()).filter(Boolean) : null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllParts(supabase: SupabaseClient): Promise<WatchRow[]> {
  const pageSize = 1000;
  const rows: WatchRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(WATCH_ROW_SELECT)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as WatchRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function magPrice(row: WatchRow): number {
  const comps = row.metadata?.competitor_prices;
  const entry = Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;
  const n = Number(entry?.price);
  return Number.isFinite(n) ? n : 0;
}

async function scrapeOgImage(
  url: string,
  apiKey: string
): Promise<{ ogImage: string | null; markdown: string }> {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      maxAge: 6 * 60 * 60 * 1000,
    }),
  });
  if (!res.ok) throw new Error(`firecrawl ${res.status}`);
  const json = (await res.json()) as {
    data?: { markdown?: string; metadata?: Record<string, unknown> };
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
  const metadata = json.data?.metadata ?? json.metadata ?? {};
  const og = metadata.ogImage ?? metadata['og:image'];
  return {
    markdown: json.data?.markdown ?? json.markdown ?? '',
    ogImage: typeof og === 'string' && og.length > 0 ? og : null,
  };
}

async function downloadHero(url: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`hero fetch ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const mime = sniffHeroMime(bytes, res.headers.get('content-type'));
  if (!mime) throw new Error('hero bytes are not jpeg/png/webp');
  return { bytes, mime };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!url || !key) throw new Error('Supabase URL / service role missing');
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY missing');

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const rows = await fetchAllParts(supabase);

  const queue: WatchCandidate[] = [];
  for (const row of rows) {
    if (args.skus && !args.skus.includes(row.sku)) continue;
    const gate = trayIntakeEligibility(row);
    if (!gate.ok) continue;
    if (magPrice(row) < args.minSticker) continue;
    const classified = classifyRow(row);
    if (isSkip(classified)) continue;
    queue.push(classified);
  }

  queue.sort((a, b) => magPrice(b.row) - magPrice(a.row));
  const sliced = args.limit ? queue.slice(0, args.limit) : queue;

  console.log(
    `Image tray intake · ${sliced.length} of ${queue.length} eligible${args.dryRun ? ' (dry run)' : ''}${
      args.minSticker ? ` · min sticker $${args.minSticker}` : ''
    }`
  );

  let stored = 0;
  let skipped = 0;
  let failed = 0;

  const worker = async (lane: number) => {
    for (let i = lane; i < sliced.length; i += CONCURRENCY) {
      const candidate = sliced[i];
      const existing = await fetchHeroReview(supabase, candidate.row.sku);
      if (existing && (existing.status === 'pending_raw' || existing.status === 'cleaned' || existing.status === 'approved')) {
        skipped++;
        process.stdout.write(
          `[${i + 1}/${sliced.length}] ${candidate.brand} ${candidate.oem} → already ${existing.status}\n`
        );
        continue;
      }

      try {
        const page = await scrapeOgImage(candidate.magUrl, apiKey);
        const snapshot = parseMagSnapshot(page.markdown, {
          magPartId: candidate.magPartId,
          brand: candidate.brand,
        });
        const hero = snapshot.identityOk
          ? heroCandidateFromOgImage(page.ogImage, candidate.magPartId)
          : null;
        if (!hero || !hero.identityOk || hero.placeholderSuspect || !page.ogImage) {
          failed++;
          process.stdout.write(
            `[${i + 1}/${sliced.length}] ${candidate.brand} ${candidate.oem} → no usable hero\n`
          );
          continue;
        }

        if (args.dryRun) {
          stored++;
          process.stdout.write(
            `[${i + 1}/${sliced.length}] ${candidate.brand} ${candidate.oem} → would store ${hero.filename}\n`
          );
        } else {
          const { bytes, mime } = await downloadHero(page.ogImage);
          await recordIntake(supabase, candidate.row, bytes, mime, hero.filename);
          stored++;
          process.stdout.write(
            `[${i + 1}/${sliced.length}] ${candidate.brand} ${candidate.oem} → stored ${hero.filename} (${bytes.length} b)\n`
          );
        }
      } catch (e) {
        failed++;
        process.stdout.write(
          `[${i + 1}/${sliced.length}] ${candidate.brand} ${candidate.oem} → ERROR ${(e as Error).message.slice(0, 80)}\n`
        );
      }
      await sleep(BASE_DELAY_MS + Math.random() * JITTER_MS);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, lane) => worker(lane)));
  console.log(`\nDone. stored=${stored} skipped=${skipped} failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
