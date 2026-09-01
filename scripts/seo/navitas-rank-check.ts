/**
 * Navitas controller keyword SERP check via DataForSEO.
 *
 * - Money keywords + target winning URLs
 * - Writes dated JSON under scripts/seo/rank-snapshots/navitas/
 * - Prints delta vs most recent prior snapshot
 *
 * Usage: npx tsx scripts/seo/navitas-rank-check.ts
 * Cost:  ~$0.002 per keyword (live regular SERP)
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const DOMAIN = 'flatearthequipment.com';
const OUT_DIR = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/navitas');

type Lane = 'brand' | 'generic' | 'cart' | 'pn';

const KEYWORDS: Array<{ keyword: string; targetUrl: string; lane: Lane }> = [
  { keyword: 'navitas controller', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas golf cart controller', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas tsx', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas tsx 3.0', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas 600a', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas 440a', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas conversion kit', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas tsx 600a', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas tac3', targetUrl: '/navitas-controllers', lane: 'brand' },
  { keyword: 'navitas tac2', targetUrl: '/navitas-controllers', lane: 'brand' },
  {
    keyword: 'golf cart controller upgrade',
    targetUrl: '/navitas-controllers',
    lane: 'generic',
  },
  {
    keyword: 'golf cart controller conversion kit',
    targetUrl: '/navitas-controllers',
    lane: 'generic',
  },
  {
    keyword: 'ezgo navitas controller',
    targetUrl: '/parts/navitas-ezgo-txt-48v-600a-conversion-kit',
    lane: 'cart',
  },
  {
    keyword: 'ezgo txt navitas',
    targetUrl: '/parts/navitas-ezgo-txt-48v-600a-conversion-kit',
    lane: 'cart',
  },
  {
    keyword: 'club car navitas controller',
    targetUrl: '/parts/navitas-club-car-iq-excel-48v-600a-conversion-kit',
    lane: 'cart',
  },
  {
    keyword: 'yamaha navitas controller',
    targetUrl: '/parts/navitas-yamaha-g29-drive-48v-600a-conversion-kit',
    lane: 'cart',
  },
  {
    keyword: 'yamaha drive2 navitas',
    targetUrl: '/parts/navitas-yamaha-drive2-neos-48v-440a-tac2-conversion-kit',
    lane: 'cart',
  },
  {
    keyword: '87-TSX3-600EZTXT',
    targetUrl: '/parts/navitas-ezgo-txt-48v-600a-conversion-kit',
    lane: 'pn',
  },
  {
    keyword: '87-TSX3-600CCIQX',
    targetUrl: '/parts/navitas-club-car-iq-excel-48v-600a-conversion-kit',
    lane: 'pn',
  },
];

type Row = {
  keyword: string;
  lane: Lane;
  targetUrl: string;
  position: number | null;
  url: string | null;
  urlMatchesTarget: boolean | null;
  topCompetitor: string;
  topUrl: string | null;
  error?: string;
};

type SnapshotFile = {
  date: string;
  domain: string;
  source: 'dataforseo-live-regular';
  rows: Row[];
};

function normalizePath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = url.startsWith('http') ? new URL(url) : new URL(url, `https://www.${DOMAIN}`);
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url.replace(`https://www.${DOMAIN}`, '').replace(/\/$/, '') || '/';
  }
}

function isOurDomain(domain: string | undefined, url: string | undefined): boolean {
  const d = (domain || '').replace(/^www\./, '');
  if (d === DOMAIN) return true;
  return Boolean(url && url.includes(DOMAIN));
}

async function checkKeyword(keyword: string, targetUrl: string, lane: Lane): Promise<Row> {
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
      lane,
      targetUrl,
      position: null,
      url: null,
      urlMatchesTarget: null,
      topCompetitor: 'n/a',
      topUrl: null,
      error: task?.status_message ?? JSON.stringify(data).slice(0, 120),
    };
  }
  const items: Array<{ rank_absolute: number; domain?: string; url?: string; type: string }> =
    task?.result?.[0]?.items ?? [];
  const organic = items.filter((i) => i.type === 'organic');
  const hit = organic.find((i) => isOurDomain(i.domain, i.url));
  const top = organic[0];
  const actual = normalizePath(hit?.url ?? null);
  const target = normalizePath(targetUrl);
  return {
    keyword,
    lane,
    targetUrl,
    position: hit?.rank_absolute ?? null,
    url: actual,
    urlMatchesTarget: hit ? actual === target : null,
    topCompetitor: top?.domain ?? 'n/a',
    topUrl: top?.url ?? null,
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
  const priorLabel = prior?.date ?? 'baseline';

  console.log(`Navitas controllers rank check — ${date} — Google US top 100`);
  console.log(`Compare vs: ${priorLabel}\n`);
  console.log(
    `${'keyword'.padEnd(44)} ${'Lane'.padEnd(8)} ${priorLabel.slice(0, 10).padStart(10)} ${'Today'.padStart(8)}  URL (target)`
  );
  console.log('-'.repeat(120));

  const rows: Row[] = [];
  for (const { keyword, targetUrl, lane } of KEYWORDS) {
    const row = await checkKeyword(keyword, targetUrl, lane);
    rows.push(row);
    if (row.error) {
      console.log(`${keyword.padEnd(44)} ${lane.padEnd(8)} ERROR: ${row.error}`);
    } else {
      const prev = prior?.rows.find((r) => r.keyword === keyword)?.position;
      const marker = moveMarker(prev, row.position);
      const mismatch =
        row.urlMatchesTarget === false ? ' ⚠ wrong URL' : row.urlMatchesTarget === true ? ' ✓' : '';
      console.log(
        `${keyword.padEnd(44)} ${lane.padEnd(8)} ${formatPos(prev).padStart(10)} ${(formatPos(row.position) + marker).padStart(8)}  ${row.url ?? '—'} → ${targetUrl}${mismatch}  [top: ${row.topCompetitor}]`
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
  const ranked = rows.filter((r) => r.position != null);
  const inTop10 = ranked.filter((r) => r.position! <= 10).length;
  const inTop30 = ranked.filter((r) => r.position! <= 30).length;
  const wrongUrl = rows.filter((r) => r.urlMatchesTarget === false).length;
  console.log(
    `\nSummary: ${ranked.length}/${rows.length} ranking · ${inTop10} top 10 · ${inTop30} top 30 · ${wrongUrl} wrong winning URL · ${erred} API errors`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
