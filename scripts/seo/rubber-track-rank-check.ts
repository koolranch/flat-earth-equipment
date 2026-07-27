/**
 * Rubber-track keyword SERP check via DataForSEO.
 *
 * - Writes dated JSON under scripts/seo/rank-snapshots/rubber-tracks/
 * - Prints delta vs most recent prior snapshot
 *
 * Usage: npx tsx scripts/seo/rubber-track-rank-check.ts
 * Cost:  ~$0.002 per keyword (live regular SERP)
 *
 * Money keywords = head/category + high-intent model terms (aligned with
 * the `tracks` group in scripts/seo/rank-snapshot.ts).
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const DOMAIN = 'flatearthequipment.com';
const OUT_DIR = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/rubber-tracks');

/** Head terms + model money keywords (purchase intent). */
const KEYWORDS = [
  // Head / category
  'skid steer rubber tracks',
  'compact track loader tracks',
  'bobcat rubber tracks',
  'jcb rubber tracks',
  // Bobcat
  'bobcat t650 tracks',
  'bobcat t770 tracks',
  'bobcat t590 tracks',
  'bobcat t550 tracks',
  'bobcat t190 tracks',
  'bobcat t66 tracks',
  'bobcat mt85 tracks',
  // Caterpillar
  'cat 259d tracks',
  'cat 279d tracks',
  'cat 289d tracks',
  // Kubota
  'kubota svl65 tracks',
  'kubota svl75 tracks',
  'kubota svl95 tracks',
  // Case
  'case tr270 tracks',
  'case tr310 tracks',
  'case tv370 tracks',
  'case tv450 tracks',
  // John Deere 3xxG
  'john deere 317g tracks',
  'john deere 325g tracks',
  'john deere 331g tracks',
  'john deere 333g tracks',
  // JCB models
  'jcb 1cxt tracks',
  'jcb 150t tracks',
  'jcb 190t tracks',
  // Takeuchi
  'takeuchi tl8 tracks',
] as const;

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
  if (!prior) return undefined;
  const row = prior.rows.find((r) => r.keyword === keyword);
  return row ? row.position : undefined;
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

  console.log(`Rubber-track rank check — ${date} — Google US top 100`);
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
  const ranked = rows.filter((r) => r.position != null).length;
  const inTop10 = rows.filter((r) => r.position != null && r.position <= 10).length;
  const inTop30 = rows.filter((r) => r.position != null && r.position <= 30).length;
  console.log(
    `\nSummary: ${ranked} ranked · ${inTop10} in top 10 · ${inTop30} in top 30 · ${erred} API errors · ${rows.length} keywords`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
