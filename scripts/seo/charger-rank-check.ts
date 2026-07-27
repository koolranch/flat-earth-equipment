/**
 * Charger-module keyword SERP check via DataForSEO.
 *
 * - Writes dated JSON under scripts/seo/rank-snapshots/charger/
 * - Prints delta vs most recent prior snapshot (or Jul 1 hard baseline)
 *
 * Usage: npx tsx scripts/seo/charger-rank-check.ts
 * Cost:  ~$0.002 per keyword (live regular SERP)
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const DOMAIN = 'flatearthequipment.com';
const OUT_DIR = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/charger');

const KEYWORDS = [
  'forklift charger module repair',
  '6la20671',
  'hyster 4092995 charger',
  'forklift battery charger module',
  'enersys battery charger',
  'hawker charger module',
  'act quantum charger module',
  '81063577r',
  '81063578r',
  '81063658r',
] as const;

/** Hard baseline from Jul 1, 2026 sitewide snapshot (charger group only). */
const JUL1_BASELINE: Record<string, { position: number | null; url: string | null }> = {
  'forklift charger module repair': { position: 45, url: '/charger-modules' },
  '6la20671': { position: 23, url: '/charger-modules' },
  'hyster 4092995 charger': {
    position: 52,
    url: '/parts?category=Battery+Chargers&sales_type=direct&page=3',
  },
  'forklift battery charger module': { position: null, url: null },
};

type Row = {
  keyword: string;
  position: number | null;
  url: string | null;
  topCompetitor: string;
  error?: string;
};

type SnapshotFile = {
  date: string;
  domain: string;
  source: 'dataforseo-live-regular';
  rows: Row[];
};

async function checkKeyword(keyword: string): Promise<Row> {
  const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        keyword,
        location_code: 2840,
        language_code: 'en',
        depth: 100,
      },
    ]),
  });
  const data = await res.json();
  const task = data?.tasks?.[0];
  if (task?.status_code !== 20000) {
    return {
      keyword,
      position: null,
      url: null,
      topCompetitor: 'n/a',
      error: task?.status_message ?? JSON.stringify(data).slice(0, 120),
    };
  }
  const items: Array<{ rank_absolute: number; domain?: string; url?: string; type: string }> =
    task?.result?.[0]?.items ?? [];
  const organic = items.filter((i) => i.type === 'organic');
  const hit = organic.find((i) => i.domain?.replace(/^www\./, '') === DOMAIN);
  const top = organic[0];
  return {
    keyword,
    position: hit?.rank_absolute ?? null,
    url: hit?.url?.replace(`https://www.${DOMAIN}`, '') ?? null,
    topCompetitor: top?.domain ?? 'n/a',
  };
}

function loadPriorSnapshot(today: string): SnapshotFile | null {
  if (!fs.existsSync(OUT_DIR)) return null;
  const files = fs
    .readdirSync(OUT_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f !== `${today}.json`)
    .sort()
    .reverse();
  if (files.length === 0) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(OUT_DIR, files[0]), 'utf8')) as SnapshotFile;
  } catch {
    return null;
  }
}

function priorPos(prior: SnapshotFile | null, keyword: string): number | null | undefined {
  if (prior) {
    const row = prior.rows.find((r) => r.keyword === keyword);
    if (row) return row.position;
  }
  return JUL1_BASELINE[keyword]?.position;
}

function formatPos(p: number | null | undefined): string {
  if (p === undefined) return '—';
  if (p == null) return 'out';
  return `#${p}`;
}

function moveMarker(prev: number | null | undefined, curr: number | null): string {
  if (curr == null && (prev == null || prev === undefined)) return '';
  if (prev == null || prev === undefined) {
    return curr != null ? ' NEW' : '';
  }
  if (curr == null) return ' LOST';
  if (curr < prev) return ' ↑';
  if (curr > prev) return ' ↓';
  return ' =';
}

async function main() {
  if (!LOGIN || !PASSWORD) {
    console.error('Missing DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD in .env.local');
    process.exit(1);
  }

  const date = new Date().toISOString().split('T')[0];
  const prior = loadPriorSnapshot(date);
  const priorLabel = prior?.date ?? 'Jul 1 baseline';

  console.log(`Charger rank check — ${date} — Google US top 100`);
  console.log(`Compare vs: ${priorLabel}\n`);
  console.log(
    `${'keyword'.padEnd(36)} ${priorLabel.slice(0, 10).padStart(10)} ${'Today'.padStart(8)}  URL`
  );
  console.log('-'.repeat(96));

  const rows: Row[] = [];
  for (const kw of KEYWORDS) {
    const row = await checkKeyword(kw);
    rows.push(row);
    if (row.error) {
      console.log(`${kw.padEnd(36)} ERROR: ${row.error}`);
    } else {
      const prev = priorPos(prior, kw);
      const marker = moveMarker(prev, row.position);
      console.log(
        `${kw.padEnd(36)} ${formatPos(prev).padStart(10)} ${(formatPos(row.position) + marker).padStart(8)}  ${row.url ?? '—'}  [top: ${row.topCompetitor}]`
      );
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${date}.json`);
  const payload: SnapshotFile = {
    date,
    domain: DOMAIN,
    source: 'dataforseo-live-regular',
    rows,
  };
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log(`\nSaved: ${outFile}`);

  const erred = rows.filter((r) => r.error).length;
  const inTop10 = rows.filter((r) => r.position != null && r.position <= 10).length;
  const inTop30 = rows.filter((r) => r.position != null && r.position <= 30).length;
  console.log(
    `\nSummary: ${inTop10} in top 10 · ${inTop30} in top 30 · ${erred} API errors · ${rows.length} keywords`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
