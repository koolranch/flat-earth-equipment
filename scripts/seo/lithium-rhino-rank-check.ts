/**
 * Lithium Rhino / golf-cart lithium keyword SERP check via DataForSEO.
 *
 * - Writes dated JSON under scripts/seo/rank-snapshots/lithium-rhino/
 * - Prints delta vs most recent prior snapshot
 *
 * Usage: npx tsx scripts/seo/lithium-rhino-rank-check.ts
 * Cost:  ~$0.002 per keyword (live regular SERP)
 *
 * Keyword priority (money keywords):
 *  1) generic commercial → /lithium-batteries hub
 *  2) brand SERPs → hub / Ah PDPs
 *  3) cart landings → /lithium-batteries/{cart}
 *  4) FSIP PNs → protect-only (PDP)
 *
 * Hard rule for monitors: never touch checkout, Stripe webhooks,
 * HazMat freight tiers, or sell prices.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const DOMAIN = 'flatearthequipment.com';
const OUT_DIR = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/lithium-rhino');

/** Money keywords in priority order. */
const KEYWORDS = [
  // 1) Generic commercial → hub
  'lithium golf cart battery',
  '48v lithium golf cart battery',
  'lithium golf cart battery conversion kit',
  '36v lithium golf cart battery',
  'lifepo4 golf cart battery',
  // 2) Brand SERPs → hub / Ah PDPs
  'lithium rhino',
  'lithium rhino battery',
  'lithium rhino golf cart battery',
  'lithium rhino 48v 65ah',
  'lithium rhino 48v 105ah',
  'lithium rhino 48v 50ah',
  'lithium rhino 36v 105ah',
  // 3) Cart landings
  'ezgo txt 48v lithium battery conversion',
  'club car precedent lithium battery',
  'ezgo rxv lithium battery',
  'yamaha drive lithium battery',
  'club car ds lithium battery',
  'yamaha drive2 lithium battery',
  // 4) FSIP PNs (protect-only)
  '113-LR51V65AH',
  '113-LR51V105AH',
  '113-LR51V50AH',
  '113-LR38V105AH',
] as const;

/**
 * Expected winning URL path (prefix match). Used to flag target mismatches
 * in the console summary — especially `lithium rhino 48v 65ah` on hub.
 */
const TARGET_URL: Record<string, string> = {
  'lithium golf cart battery': '/lithium-batteries',
  '48v lithium golf cart battery': '/lithium-batteries',
  'lithium golf cart battery conversion kit': '/lithium-batteries',
  '36v lithium golf cart battery': '/lithium-batteries',
  'lifepo4 golf cart battery': '/lithium-batteries',
  'lithium rhino': '/lithium-batteries',
  'lithium rhino battery': '/lithium-batteries',
  'lithium rhino golf cart battery': '/lithium-batteries',
  'lithium rhino 48v 65ah': '/parts/lithium-rhino-48v-65ah-kit',
  'lithium rhino 48v 105ah': '/parts/lithium-rhino-48v-105ah-kit',
  'lithium rhino 48v 50ah': '/parts/lithium-rhino-48v-50ah-kit',
  'lithium rhino 36v 105ah': '/parts/lithium-rhino-36v-105ah-kit',
  'ezgo txt 48v lithium battery conversion': '/lithium-batteries/ezgo-txt-48v',
  'club car precedent lithium battery': '/lithium-batteries/club-car-precedent-48v',
  'ezgo rxv lithium battery': '/lithium-batteries/ezgo-rxv-48v',
  'yamaha drive lithium battery': '/lithium-batteries/yamaha-drive-48v',
  'club car ds lithium battery': '/lithium-batteries/club-car-ds-48v',
  'yamaha drive2 lithium battery': '/lithium-batteries/yamaha-drive2-48v',
  '113-LR51V65AH': '/parts/lithium-rhino-48v-65ah-kit',
  '113-LR51V105AH': '/parts/lithium-rhino-48v-105ah-kit',
  '113-LR51V50AH': '/parts/lithium-rhino-48v-50ah-kit',
  '113-LR38V105AH': '/parts/lithium-rhino-36v-105ah-kit',
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

function urlMatchesTarget(actual: string | null, target: string | undefined): boolean {
  if (!actual || !target) return true;
  const a = actual.split('?')[0].replace(/\/$/, '');
  const t = target.replace(/\/$/, '');
  return a === t || a.startsWith(`${t}/`);
}

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

  console.log(`Lithium Rhino rank check — ${date} — Google US top 100`);
  console.log(`Compare vs: ${priorLabel}\n`);
  console.log(
    `${'keyword'.padEnd(42)} ${priorLabel.slice(0, 10).padStart(10)} ${'Today'.padStart(8)}  URL`
  );
  console.log('-'.repeat(110));

  const rows: Row[] = [];
  for (const kw of KEYWORDS) {
    const row = await checkKeyword(kw);
    rows.push(row);
    if (row.error) {
      console.log(`${kw.padEnd(42)} ERROR: ${row.error}`);
    } else {
      const prev = priorPos(prior, kw);
      const marker = moveMarker(prev, row.position);
      const target = TARGET_URL[kw];
      const mismatch =
        row.position != null && target && !urlMatchesTarget(row.url, target)
          ? `  ⚠ want ${target}`
          : '';
      console.log(
        `${kw.padEnd(42)} ${formatPos(prev).padStart(10)} ${(formatPos(row.position) + marker).padStart(8)}  ${row.url ?? '—'}  [top: ${row.topCompetitor}]${mismatch}`
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
  const mismatches = rows.filter(
    (r) =>
      r.position != null &&
      TARGET_URL[r.keyword] &&
      !urlMatchesTarget(r.url, TARGET_URL[r.keyword])
  );

  console.log(
    `\nSummary: ${ranked} ranked · ${inTop10} in top 10 · ${inTop30} in top 30 · ${erred} API errors · ${rows.length} keywords`
  );
  if (mismatches.length > 0) {
    console.log(`\nTarget-URL mismatches (${mismatches.length}):`);
    for (const m of mismatches) {
      console.log(`  - ${m.keyword}: got ${m.url ?? '—'} · want ${TARGET_URL[m.keyword]}`);
    }
  }

  const kw65 = rows.find((r) => r.keyword === 'lithium rhino 48v 65ah');
  if (kw65?.position != null) {
    const onHub = (kw65.url ?? '').replace(/\/$/, '') === '/lithium-batteries';
    if (onHub) {
      console.log(
        '\nFLAG: lithium rhino 48v 65ah still wins on hub /lithium-batteries — target is /parts/lithium-rhino-48v-65ah-kit'
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
