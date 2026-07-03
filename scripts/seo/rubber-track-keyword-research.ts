/**
 * One-off keyword research for the rubber tracks category rollout.
 *
 * Pulls Google Ads US search volume + CPC via DataForSEO for generic,
 * brand-level, model-level, and track-size keywords so we can pick the
 * highest-demand models to stock first.
 *
 * Usage: npx tsx scripts/seo/rubber-track-keyword-research.ts
 * Output: scripts/seo/rank-snapshots/rubber-tracks-keywords-YYYY-MM-DD.json
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const LOCATION_US = 2840;

const KEYWORDS: Record<string, string[]> = {
  generic: [
    'rubber tracks',
    'rubber tracks for skid steer',
    'skid steer rubber tracks',
    'mini excavator rubber tracks',
    'rubber tracks for mini excavator',
    'ctl rubber tracks',
    'compact track loader tracks',
    'replacement rubber tracks',
    'aftermarket rubber tracks',
  ],
  'brand-bobcat': [
    'bobcat rubber tracks',
    'bobcat t190 tracks',
    'bobcat t650 tracks',
    'bobcat t590 tracks',
    'bobcat t770 tracks',
    'bobcat t66 tracks',
    'bobcat t76 tracks',
    'bobcat mt85 tracks',
    'bobcat e35 tracks',
    'bobcat e42 tracks',
    'bobcat e50 tracks',
    'bobcat 331 tracks',
    'bobcat t550 tracks',
    'bobcat t450 tracks',
  ],
  'brand-kubota': [
    'kubota rubber tracks',
    'kubota svl75 tracks',
    'kubota svl75-2 tracks',
    'kubota svl65 tracks',
    'kubota svl95 tracks',
    'kubota svl97 tracks',
    'kubota kx040 tracks',
    'kubota kx057 tracks',
    'kubota u35 tracks',
    'kubota u55 tracks',
    'kubota kx033 tracks',
    'kubota kx71 tracks',
  ],
  'brand-cat': [
    'cat rubber tracks',
    'cat 259d tracks',
    'cat 279d tracks',
    'cat 289d tracks',
    'cat 299d tracks',
    'cat 305 tracks',
    'cat 303.5 tracks',
    'cat 308 tracks',
    'caterpillar skid steer tracks',
  ],
  'brand-takeuchi': [
    'takeuchi rubber tracks',
    'takeuchi tl8 tracks',
    'takeuchi tl10 tracks',
    'takeuchi tl12 tracks',
    'takeuchi tb216 tracks',
    'takeuchi tb240 tracks',
    'takeuchi tb260 tracks',
    'takeuchi tb290 tracks',
  ],
  'brand-deere': [
    'john deere rubber tracks',
    'john deere 317g tracks',
    'john deere 325g tracks',
    'john deere 331g tracks',
    'john deere 333g tracks',
    'john deere 35g tracks',
    'john deere 50g tracks',
  ],
  'brand-case-nh': [
    'case rubber tracks',
    'case tr270 tracks',
    'case tr310 tracks',
    'case tv370 tracks',
    'case tv450 tracks',
    'new holland rubber tracks',
    'new holland c232 tracks',
    'new holland c227 tracks',
  ],
  'brand-other': [
    'asv rubber tracks',
    'asv rt75 tracks',
    'gehl rt165 tracks',
    'gehl rubber tracks',
    'yanmar rubber tracks',
    'yanmar vio35 tracks',
    'komatsu rubber tracks',
    'jcb rubber tracks',
    'toro dingo tracks',
    'mustang skid steer tracks',
  ],
  'size-terms': [
    '320x86x52 rubber track',
    '450x86x55 rubber track',
    '400x86x52 rubber track',
    '400x86x56 rubber track',
    '300x52.5x84 rubber track',
    '230x48x70 rubber track',
    '250x72x45 rubber track',
    '180x72x39 rubber track',
    '320x86x53 rubber track',
    '450x86x56 rubber track',
  ],
};

type Row = {
  keyword: string;
  group: string;
  volume: number | null;
  cpc: number | null;
  competition: string | null;
};

async function main() {
  const flat: { keyword: string; group: string }[] = [];
  for (const [group, kws] of Object.entries(KEYWORDS)) {
    for (const keyword of kws) flat.push({ keyword, group });
  }

  const res = await fetch(
    'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keywords: flat.map((k) => k.keyword),
          location_code: LOCATION_US,
          language_code: 'en',
        },
      ]),
    }
  );
  const data = await res.json();
  const items: Array<{
    keyword: string;
    search_volume: number | null;
    cpc: number | null;
    competition: string | null;
  }> = data?.tasks?.[0]?.result ?? [];

  if (!items.length) {
    console.error('No results. Raw response:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const byKeyword = new Map(items.map((i) => [i.keyword.toLowerCase(), i]));
  const rows: Row[] = flat.map(({ keyword, group }) => {
    const hit = byKeyword.get(keyword.toLowerCase());
    return {
      keyword,
      group,
      volume: hit?.search_volume ?? null,
      cpc: hit?.cpc ?? null,
      competition: hit?.competition ?? null,
    };
  });

  rows.sort((a, b) => (b.volume ?? -1) - (a.volume ?? -1));

  const date = new Date().toISOString().split('T')[0];
  const outFile = path.resolve(
    process.cwd(),
    `scripts/seo/rank-snapshots/rubber-tracks-keywords-${date}.json`
  );
  fs.writeFileSync(outFile, JSON.stringify({ date, location: 'US', rows }, null, 2));

  console.log(`\nRubber track keyword volumes (Google Ads, US) — ${date}\n`);
  for (const row of rows) {
    const vol = row.volume === null ? 'n/a' : String(row.volume);
    const cpc = row.cpc === null ? '' : `$${row.cpc.toFixed(2)}`;
    console.log(
      `  ${row.keyword.padEnd(42)} ${vol.padStart(7)}  ${cpc.padStart(7)}  ${row.competition ?? ''}  [${row.group}]`
    );
  }
  console.log(`\nSaved: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
