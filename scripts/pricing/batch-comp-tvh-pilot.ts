/**
 * Intella / Magnasource-first public-comp pilot for quote_only OEM parts.
 *
 * Accepts a comp only when the PDP scrape shows a real on-page `$` price
 * (rejects login walls / Magnasource bot pages). Proposes sell = 5% under.
 * Does NOT write to Stripe / Supabase — review apply JSON first.
 *
 * Usage:
 *   npx tsx scripts/pricing/batch-comp-tvh-pilot.ts
 *   npx tsx scripts/pricing/batch-comp-tvh-pilot.ts --limit 12
 *   npx tsx scripts/pricing/batch-comp-tvh-pilot.ts --file data/pricing/tvh-comp-pilot-targets.json
 *
 * Requires FIRECRAWL_API_KEY.
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { COMP_SOURCES, toMagnasourcePartId } from '../../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PRIMARY_DOMAINS = ['magnasourceinc.com', 'intellaparts.com'] as const;
const FALLBACK_DOMAINS = ['gciron.com'] as const;

type Target = {
  sku: string;
  slug: string;
  brand: string;
  oem: string;
  category: string;
  source: string;
  bucket?: string;
};

type ApplyRow = {
  sku: string;
  slug: string;
  brand: string;
  oem: string;
  category: string;
  compPrice: number;
  sellPrice: number;
  compSource: string;
  compUrl: string;
  inStockHint: string | null;
  tvhAligned: boolean;
};

type RejectRow = Target & {
  reason: string;
  candidateUrls?: string[];
};

type SearchHit = {
  url?: string;
  title?: string;
  description?: string;
};

function extractPrices(text: string, min = 8, max = 5000): number[] {
  const out: number[] = [];
  const re = /\$\s*([0-9]{1,5}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = Number(m[1].replace(/,/g, ''));
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
  const noSlash = raw.replace(/\//g, '');
  return Array.from(
    new Set([raw, noDash, noSlash, raw.toUpperCase(), noDash.toUpperCase(), noSlash.toUpperCase()])
  );
}

function urlLooksProduct(url: string, oem: string): boolean {
  const p = url.toLowerCase();
  return (
    oemNorms(oem).some((n) => p.includes(n.toLowerCase())) ||
    /\/(itm|p|itemdetail|product|catalog)\//i.test(url)
  );
}

function isTvhDomain(url: string): boolean {
  return /magnasourceinc\.com|intellaparts\.com/i.test(url);
}

function isLoginOrBotWall(md: string, url: string): boolean {
  const lower = md.toLowerCase();
  if (/sorry,\s*the requested item|no longer valid|access denied|captcha|cloudflare/i.test(lower)) {
    return true;
  }
  if (/intellaparts\.com/i.test(url)) {
    if (
      /sign in|log in|login to (see|view)|customer login|create an account/i.test(lower) &&
      !/\$\s*[0-9]/.test(md.slice(0, 6000))
    ) {
      return true;
    }
  }
  if (/magnasourceinc\.com/i.test(url) && !/\$\s*[0-9]/.test(md.slice(0, 6000))) {
    return true;
  }
  return false;
}

function stockHint(md: string): string | null {
  const slice = md.slice(0, 8000);
  if (/in\s*stock/i.test(slice) && !/out of stock/i.test(slice)) return 'in_stock';
  if (/available\s*(now|for|to ship)/i.test(slice)) return 'available';
  if (/ships?\s*(today|same day|next day)/i.test(slice)) return 'ships_soon';
  if (/out of stock|backorder|temporarily unavailable/i.test(slice)) return 'out_of_stock';
  return null;
}

function priceBounds(bucket: string | undefined, category: string): { min: number; max: number } {
  if (bucket === 'glass' || /cab glass/i.test(category)) return { min: 25, max: 2500 };
  if (bucket === 'valves' || /hydraulic/i.test(category)) return { min: 15, max: 500 };
  if (bucket === 'controllers') return { min: 40, max: 900 };
  return { min: 8, max: 1200 };
}

async function search(
  query: string,
  apiKey: string,
  domains: readonly string[]
): Promise<SearchHit[]> {
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: 5,
      includeDomains: [...domains],
      sources: [{ type: 'web' }],
    }),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const json = (await res.json()) as {
    data?: { web?: SearchHit[] };
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

function directCandidateUrls(t: Target): string[] {
  const urls: string[] = [];
  const ms = COMP_SOURCES.magnasource.buildUrl(t.oem, t.brand);
  if (ms) urls.push(ms);
  const intella = COMP_SOURCES.intella.buildUrl(t.oem, t.brand);
  if (intella) urls.push(intella);
  const gc = COMP_SOURCES.gciron.buildUrl(t.oem, t.brand);
  if (gc) urls.push(gc);
  return urls;
}

async function verifyUrl(
  url: string,
  t: Target,
  apiKey: string,
  snippetText = ''
): Promise<ApplyRow | { reject: string } | null> {
  let md = '';
  try {
    md = await scrape(url, apiKey);
  } catch (e) {
    return { reject: `scrape_error_${(e as Error).message.slice(0, 40)}` };
  }

  if (isLoginOrBotWall(md, url)) {
    return { reject: isTvhDomain(url) ? 'tvh_login_or_bot_wall' : 'login_or_bot_wall' };
  }

  const lower = md.toLowerCase();
  const oemOnPage = oemNorms(t.oem).some((n) => lower.includes(n.toLowerCase()));
  // Magnasource itemdetail URLs encode the PN — allow if URL contains normalized PN
  const oemInUrl = oemNorms(t.oem).some((n) =>
    url.toLowerCase().includes(n.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  if (!oemOnPage && !oemInUrl) {
    return { reject: 'oem_not_on_page' };
  }

  const { min, max } = priceBounds(t.bucket, t.category);
  const prices = extractPrices(md.slice(0, 8000), min, max);
  const snippetPrices = extractPrices(snippetText, min, max);
  if (!prices.length) {
    // TVH network: never accept snippet-only without on-page `$`
    if (isTvhDomain(url)) return { reject: 'tvh_no_on_page_price' };
    if (!snippetPrices.length) return { reject: 'no_price' };
  }

  let price = (prices.length ? prices : snippetPrices).sort((a, b) => a - b)[0];
  if (snippetPrices.length && prices.length) {
    const near = prices.find((p) =>
      snippetPrices.some((s) => Math.abs(p - s) / s <= 0.25)
    );
    if (near) price = near;
  }

  if (price < min || price > max) return { reject: `price_out_of_bounds_${price}` };

  const sellPrice = parseFloat((price * 0.95).toFixed(2));
  return {
    sku: t.sku,
    slug: t.slug,
    brand: t.brand,
    oem: t.oem,
    category: t.category,
    compPrice: price,
    sellPrice,
    compSource: sourceId(url),
    compUrl: url.split('?')[0],
    inStockHint: stockHint(md),
    tvhAligned: isTvhDomain(url),
  };
}

async function processTarget(
  t: Target,
  apiKey: string
): Promise<{ found: ApplyRow | null; reason?: string; urls: string[]; log: unknown }> {
  const candidateUrls: string[] = [];
  const query = `"${t.oem}" ${t.brand} (price OR "in stock")`;

  // 1) Google-style search restricted to Intella / Magnasource
  let hits: SearchHit[] = [];
  try {
    hits = await search(query, apiKey, PRIMARY_DOMAINS);
  } catch (e) {
    return {
      found: null,
      reason: `search_error_${(e as Error).message.slice(0, 40)}`,
      urls: [],
      log: { ...t, error: (e as Error).message },
    };
  }

  for (const hit of hits) {
    const url = (hit.url ?? '').split('?')[0];
    if (!url) continue;
    if (!isTvhDomain(url)) continue;
    if (!urlLooksProduct(url, t.oem) && !extractPrices(`${hit.title} ${hit.description}`).length) {
      continue;
    }
    candidateUrls.push(url);
  }

  // 2) Always try direct Magnasource itemdetail + Intella search URL
  for (const url of directCandidateUrls(t)) {
    if (!candidateUrls.includes(url.split('?')[0])) candidateUrls.push(url);
  }

  let lastReject = 'no_verified_comp';
  for (const url of candidateUrls) {
    if (!isTvhDomain(url) && !/gciron\.com/i.test(url)) continue;
    // Prefer TVH first — skip GC Iron until TVH exhausted
    if (/gciron\.com/i.test(url)) continue;

    const result = await verifyUrl(
      url,
      t,
      apiKey,
      hits
        .filter((h) => (h.url ?? '').startsWith(url.split('?')[0]))
        .map((h) => `${h.title} ${h.description}`)
        .join(' ')
    );
    await sleep(250);
    if (!result) continue;
    if ('reject' in result) {
      lastReject = result.reject;
      continue;
    }
    return { found: result, urls: candidateUrls, log: { ...t, found: result, candidates: candidateUrls } };
  }

  // 3) Weak JLG-only GC Iron fallback
  if (t.brand.toUpperCase() === 'JLG') {
    let fbHits: SearchHit[] = [];
    try {
      fbHits = await search(`"${t.oem}" ${t.brand} price`, apiKey, FALLBACK_DOMAINS);
    } catch {
      fbHits = [];
    }
    for (const hit of fbHits) {
      const url = (hit.url ?? '').split('?')[0];
      if (!url || !/gciron\.com/i.test(url)) continue;
      candidateUrls.push(url);
      const result = await verifyUrl(url, t, apiKey, `${hit.title} ${hit.description}`);
      await sleep(250);
      if (!result) continue;
      if ('reject' in result) {
        lastReject = result.reject;
        continue;
      }
      return {
        found: result,
        urls: candidateUrls,
        log: { ...t, found: result, candidates: candidateUrls, fallback: 'gciron' },
      };
    }
  }

  return {
    found: null,
    reason: lastReject,
    urls: candidateUrls,
    log: { ...t, found: null, reason: lastReject, candidates: candidateUrls },
  };
}

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error(
      'FIRECRAWL_API_KEY missing. Set it in .env.local or run: npx firecrawl-cli login --api-key <key>'
    );
  }

  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;
  const fileArg = process.argv.indexOf('--file');
  const outArg = process.argv.indexOf('--out');
  const outPrefix = outArg >= 0 ? process.argv[outArg + 1] : 'tvh-comp-pilot';

  const targetsPath = path.resolve(
    process.cwd(),
    fileArg >= 0 ? process.argv[fileArg + 1] : 'data/pricing/tvh-comp-pilot-targets.json'
  );
  if (!fs.existsSync(targetsPath)) {
    console.error(`Missing targets file: ${targetsPath}`);
    process.exit(1);
  }

  let targets: Target[] = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  targets = targets.slice(0, Number.isFinite(limit) ? limit : undefined);

  console.log(
    `TVH Intella/Magna pilot — ${targets.length} targets from ${path.basename(targetsPath)}\n`
  );
  console.log(`Magnasource PN example: ${toMagnasourcePartId(targets[0]?.oem ?? 'TEST')}\n`);

  const apply: ApplyRow[] = [];
  const rejected: RejectRow[] = [];
  const searchLog: unknown[] = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] ${t.brand} ${t.oem} … `);
    try {
      const { found, reason, urls, log } = await processTarget(t, apiKey);
      searchLog.push(log);
      if (found) {
        apply.push(found);
        const stock = found.inStockHint ? ` stock=${found.inStockHint}` : '';
        console.log(
          `$${found.compPrice} → $${found.sellPrice} ${found.compSource}${stock}`
        );
      } else {
        rejected.push({ ...t, reason: reason || 'no_verified_comp', candidateUrls: urls });
        console.log(`miss (${reason})`);
      }
    } catch (e) {
      rejected.push({
        ...t,
        reason: `error_${(e as Error).message.slice(0, 40)}`,
      });
      console.log(`ERR ${(e as Error).message.slice(0, 50)}`);
    }
    await sleep(350);
  }

  const outDir = path.resolve(process.cwd(), 'data/pricing');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, `${outPrefix}-search.json`),
    JSON.stringify(searchLog, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(outDir, `${outPrefix}-apply.json`),
    JSON.stringify(apply, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(outDir, `${outPrefix}-rejected.json`),
    JSON.stringify(rejected, null, 2) + '\n'
  );

  console.log(`\nApply-ready ${apply.length} | rejected ${rejected.length}`);
  console.log(`Apply: data/pricing/${outPrefix}-apply.json`);
  console.log('No Stripe / Supabase writes — review before Buy Now.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
