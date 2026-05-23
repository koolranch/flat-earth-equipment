/**
 * Look up public retail comp prices for seat SKUs (Magnasource alternative).
 *
 * Tries scrapeable sources in priority order:
 *   1. GC Iron (JLG / SkyTrak numeric PNs)
 *   2. Direct URL from lib/pricing/compSources (Magnasource — often bot-blocked)
 *
 * Usage:
 *   npx tsx scripts/lookup-comp-prices.ts CT315-3904 GN123574 JL91563158
 *   npx tsx scripts/lookup-comp-prices.ts --file data/pricing/hub-batch-candidates.txt
 *
 * Output: JSON array suitable for data/pricing/*.json (add compPrice, review, then sync-priced-batch).
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { COMP_SOURCES, toMagnasourcePartId } from '../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type CompHit = {
  sku: string;
  oem: string;
  brand: string;
  source: string;
  priceUsd: number | null;
  url: string;
  status: 'found' | 'blocked' | 'not_found' | 'error';
  note?: string;
};

function parsePrice(text: string): number | null {
  const sale = text.match(/Sale Price:\s*\$([\d,]+(?:\.\d{2})?)/i);
  if (sale) return parseFloat(sale[1].replace(/,/g, ''));
  const regular = text.match(/Regular price\s*\$([\d,]+(?:\.\d{2})?)/i);
  if (regular) return parseFloat(regular[1].replace(/,/g, ''));
  const usd = text.match(/\$\s*([\d,]+(?:\.\d{2})?)\s*USD/i);
  if (usd) return parseFloat(usd[1].replace(/,/g, ''));
  const plain = text.match(/(?:US \$|\$)([\d,]+(?:\.\d{2})?)/);
  if (plain) return parseFloat(plain[1].replace(/,/g, ''));
  return null;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FlatEarthEquipment-CompLookup/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function lookupGcIron(oem: string): Promise<CompHit | null> {
  const id = oem.replace(/^JL/i, '').replace(/[^0-9]/g, '');
  if (!id) return null;
  const url = `https://www.gciron.com/JLG_Parts_${id}_SUSPENSION_SEAT_p/${id}.htm`;
  const html = await fetchText(url);
  if (!html) return null;
  if (html.includes('Sale Price:') || html.includes('Our Price:')) {
    const price = parsePrice(html);
    return {
      sku: oem,
      oem,
      brand: 'JLG',
      source: 'gciron',
      priceUsd: price,
      url,
      status: price ? 'found' : 'not_found',
    };
  }
  return null;
}

async function lookupMagnasource(oem: string, brand: string): Promise<CompHit> {
  const url = COMP_SOURCES.magnasource.buildUrl(oem, brand)!;
  const html = await fetchText(url);
  if (!html) {
    return { sku: oem, oem, brand, source: 'magnasource', priceUsd: null, url, status: 'error' };
  }
  if (html.includes('no longer valid') || html.includes('Sorry, the requested item')) {
    return {
      sku: oem,
      oem,
      brand,
      source: 'magnasource',
      priceUsd: null,
      url,
      status: 'blocked',
      note: 'Bot-blocked — check manually or use web search for Alpine/eBay comps',
    };
  }
  const price = parsePrice(html);
  return {
    sku: oem,
    oem,
    brand,
    source: 'magnasource',
    priceUsd: price,
    url,
    status: price ? 'found' : 'not_found',
  };
}

async function lookupSku(sku: string): Promise<CompHit[]> {
  const { data: part } = await supabase
    .from('parts')
    .select('sku, oem_reference, brand')
    .eq('sku', sku)
    .maybeSingle();

  const oem = part?.oem_reference ?? sku;
  const brand = part?.brand ?? '';
  const hits: CompHit[] = [];

  if (brand === 'JLG' || oem.startsWith('JL')) {
    const gc = await lookupGcIron(oem);
    if (gc) hits.push(gc);
  }

  hits.push(await lookupMagnasource(oem, brand));
  return hits;
}

async function main() {
  const fileIdx = process.argv.indexOf('--file');
  let skus: string[];

  if (fileIdx !== -1 && process.argv[fileIdx + 1]) {
    const lines = fs
      .readFileSync(path.resolve(process.cwd(), process.argv[fileIdx + 1]), 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    skus = lines;
  } else {
    skus = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  }

  if (skus.length === 0) {
    console.error('Usage: npx tsx scripts/lookup-comp-prices.ts SKU1 SKU2 ...');
    process.exit(1);
  }

  const all: CompHit[] = [];
  for (const sku of skus) {
    const hits = await lookupSku(sku);
    all.push(...hits);
    for (const h of hits) {
      const price = h.priceUsd != null ? `$${h.priceUsd}` : '—';
      console.log(`${h.sku} [${h.source}] ${h.status} ${price}  ${h.url}`);
      if (h.note) console.log(`   ${h.note}`);
    }
    console.log('');
  }

  const outPath = path.resolve(process.cwd(), 'data/pricing/comp-lookup-latest.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
