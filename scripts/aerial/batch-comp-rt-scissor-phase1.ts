/**
 * Search + verify public comps for RT scissor Phase 1 quote_only parts.
 *
 * Usage:
 *   npx tsx scripts/aerial/batch-comp-rt-scissor-phase1.ts
 *   npx tsx scripts/aerial/batch-comp-rt-scissor-phase1.ts --buckets controllers,accessories
 *   npx tsx scripts/aerial/batch-comp-rt-scissor-phase1.ts --limit 40
 *   npx tsx scripts/aerial/batch-comp-rt-scissor-phase1.ts --file data/pricing/rt-scissor-phase2-comp-targets.json --out rt-scissor-phase2
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DOMAINS = [
  'magnasourceinc.com',
  'gciron.com',
  'intellaparts.com',
  'ebay.com',
  'amazon.com',
  'walmart.com',
  'fridayparts.com',
  'partsonline.com',
  'worthingtonagparts.com',
];

type Target = {
  sku: string;
  slug: string;
  brand: string;
  oem: string;
  bucket: string;
  vendor_pn: string;
};

type ApplyRow = {
  sku: string;
  compPrice: number;
  compSource: string;
  compUrl: string;
};

function extractPrices(text: string, min = 8, max = 1200): number[] {
  const out: number[] = [];
  const re = /\$\s*([0-9]{1,4}(?:\.[0-9]{2})?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = Number(m[1]);
    if (n >= min && n <= max) out.push(n);
  }
  return out;
}

function sourceId(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    return (h.split('.').slice(-2, -1)[0] || h).replace(/[^a-z0-9]/gi, '').toLowerCase();
  } catch {
    return 'web';
  }
}

function oemNorms(oem: string): string[] {
  const raw = oem.trim();
  const noDash = raw.replace(/-/g, '');
  return Array.from(new Set([raw, noDash, raw.toUpperCase(), noDash.toUpperCase()]));
}

function urlLooksProduct(url: string, oem: string): boolean {
  const path = url.toLowerCase();
  return oemNorms(oem).some((n) => path.includes(n.toLowerCase())) || /\/(itm|p|itemdetail|product)\//i.test(url);
}

async function search(query: string, apiKey: string) {
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: 5,
      includeDomains: DOMAINS,
      sources: [{ type: 'web' }],
    }),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const json = (await res.json()) as {
    data?: { web?: Array<{ url?: string; title?: string; description?: string }> };
  };
  return json.data?.web ?? [];
}

async function scrape(url: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
  });
  if (!res.ok) throw new Error(`scrape ${res.status}`);
  const json = (await res.json()) as { data?: { markdown?: string } };
  return json.data?.markdown ?? '';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY missing');

  const bucketArg = process.argv.indexOf('--buckets');
  const buckets =
    bucketArg >= 0
      ? new Set(process.argv[bucketArg + 1].split(',').map((s) => s.trim()))
      : null;
  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;
  const fileArg = process.argv.indexOf('--file');
  const outArg = process.argv.indexOf('--out');
  const outPrefix =
    outArg >= 0 ? process.argv[outArg + 1] : 'rt-scissor-phase1-comps';

  const targetsPath = path.resolve(
    process.cwd(),
    fileArg >= 0
      ? process.argv[fileArg + 1]
      : 'data/pricing/rt-scissor-phase1-comp-targets.json'
  );
  let targets: Target[] = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  if (buckets) targets = targets.filter((t) => buckets.has(t.bucket));
  targets = targets.slice(0, Number.isFinite(limit) ? limit : undefined);

  console.log(`RT scissor comps — ${targets.length} targets from ${path.basename(targetsPath)}\n`);

  const verified: ApplyRow[] = [];
  const rejected: Array<Target & { reason: string }> = [];
  const searchLog: unknown[] = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] ${t.brand} ${t.oem} (${t.bucket}) … `);
    try {
      const termHint =
        t.bucket === 'valves'
          ? '(solenoid OR valve OR coil OR dump OR brake OR steer)'
          : '(joystick OR switch OR relay OR alarm OR horn OR sensor OR breaker OR controller)';
      const hits = await search(`"${t.oem}" ${t.brand} ${termHint} price`, apiKey);
      let found: ApplyRow | null = null;

      for (const hit of hits) {
        const url = (hit.url ?? '').split('?')[0];
        if (!url) continue;
        // Intella / Magnasource often hide price — still try scrape; skip if login wall later
        if (!urlLooksProduct(url, t.oem) && !extractPrices(`${hit.title} ${hit.description}`).length) {
          continue;
        }

        let md = '';
        try {
          md = await scrape(url, apiKey);
        } catch {
          continue;
        }

        const lower = md.toLowerCase();
        const oemOnPage = oemNorms(t.oem).some((n) => lower.includes(n.toLowerCase()));
        if (!oemOnPage) continue;

        const prices = extractPrices(md.slice(0, 7000));
        const snippetPrices = extractPrices(`${hit.title} ${hit.description}`);
        if (!prices.length && !snippetPrices.length) continue;

        let price = (prices.length ? prices : snippetPrices).sort((a, b) => a - b)[0];
        if (snippetPrices.length && prices.length) {
          const near = prices.find((p) =>
            snippetPrices.some((s) => Math.abs(p - s) / s <= 0.25)
          );
          if (near) price = near;
        }

        // Controllers can be $150–800; valves often $25–350; switches/relays $8–120
        const minOk = t.bucket === 'controllers' ? 40 : t.bucket === 'valves' ? 15 : 8;
        const maxOk = t.bucket === 'controllers' ? 900 : t.bucket === 'valves' ? 500 : 400;
        if (price < minOk || price > maxOk) continue;

        // Skip Magnasource/Intella if we couldn't get a real on-page price (often login)
        if (
          /magnasource|intellaparts/i.test(url) &&
          !/\$\s*[0-9]/.test(md.slice(0, 4000))
        ) {
          continue;
        }

        found = {
          sku: t.sku,
          compPrice: price,
          compSource: sourceId(url),
          compUrl: url,
        };
        break;
      }

      searchLog.push({ ...t, found });
      if (found) {
        verified.push(found);
        console.log(`$${found.compPrice} ${found.compSource}`);
      } else {
        rejected.push({ ...t, reason: 'no_verified_comp' });
        console.log('miss');
      }
    } catch (e) {
      rejected.push({ ...t, reason: `error_${(e as Error).message.slice(0, 40)}` });
      console.log(`ERR ${(e as Error).message.slice(0, 50)}`);
    }
    await sleep(350);
  }

  const outDir = path.resolve(process.cwd(), 'data/pricing');
  fs.writeFileSync(path.join(outDir, `${outPrefix}-verified.json`), JSON.stringify(verified, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, `${outPrefix}-apply.json`), JSON.stringify(verified, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, `${outPrefix}-rejected.json`), JSON.stringify(rejected, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, `${outPrefix}-search.json`), JSON.stringify(searchLog, null, 2) + '\n');

  console.log(`\nVerified ${verified.length} | rejected ${rejected.length}`);
  console.log(`Apply: data/pricing/${outPrefix}-apply.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
