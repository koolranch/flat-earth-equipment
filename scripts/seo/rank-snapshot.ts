/**
 * Rank-tracking snapshot via DataForSEO SERP API.
 *
 * Checks where flatearthequipment.com ranks (top 100, Google US) for the
 * SEO-rollout target keywords and saves a dated JSON baseline alongside a
 * printed table. Re-run monthly and compare files to track movement.
 *
 * Usage: npx tsx scripts/seo/rank-snapshot.ts
 * Cost:  ~$0.002 per keyword (live regular SERP)
 * Output: scripts/seo/rank-snapshots/YYYY-MM-DD.json
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const DOMAIN = 'flatearthequipment.com';
const LOCATION_US = 2840;

type TargetKeyword = { keyword: string; language: 'en' | 'es'; group: string };

const KEYWORDS: TargetKeyword[] = [
  // English certification — head terms (paid-search territory, tracked for context)
  { keyword: 'forklift certification', language: 'en', group: 'cert-head' },
  { keyword: 'online forklift certification', language: 'en', group: 'cert-head' },
  { keyword: 'osha forklift certification', language: 'en', group: 'cert-head' },
  // English certification — state long-tail (primary organic play)
  { keyword: 'forklift certification texas', language: 'en', group: 'cert-state' },
  { keyword: 'forklift certification california', language: 'en', group: 'cert-state' },
  { keyword: 'forklift certification florida', language: 'en', group: 'cert-state' },
  { keyword: 'forklift certification ohio', language: 'en', group: 'cert-state' },
  { keyword: 'how to get forklift certified in texas', language: 'en', group: 'cert-state' },
  // English certification — informational
  { keyword: 'how to get forklift certified', language: 'en', group: 'cert-info' },
  { keyword: 'forklift certification cost', language: 'en', group: 'cert-info' },
  { keyword: 'forklift license', language: 'en', group: 'cert-info' },
  { keyword: 'forklift recertification online', language: 'en', group: 'cert-info' },
  // Spanish cluster (June 2026 content rollout)
  { keyword: 'certificación de montacargas', language: 'es', group: 'spanish' },
  { keyword: 'curso de montacargas', language: 'es', group: 'spanish' },
  { keyword: 'licencia de montacargas', language: 'es', group: 'spanish' },
  { keyword: 'como sacar la licencia de montacargas', language: 'es', group: 'spanish' },
  { keyword: 'cuanto cuesta la certificacion de montacargas', language: 'es', group: 'spanish' },
  { keyword: 'curso de montacargas en linea', language: 'es', group: 'spanish' },
  // Lithium golf cart batteries
  { keyword: 'lithium golf cart battery', language: 'en', group: 'lithium' },
  { keyword: '48v lithium golf cart battery', language: 'en', group: 'lithium' },
  { keyword: 'ezgo txt 48v lithium battery conversion', language: 'en', group: 'lithium' },
  { keyword: 'club car precedent lithium battery', language: 'en', group: 'lithium' },
  { keyword: 'lithium golf cart battery conversion kit', language: 'en', group: 'lithium' },
  // Rubber tracks (July 2026 category launch)
  { keyword: 'skid steer rubber tracks', language: 'en', group: 'tracks' },
  { keyword: 'compact track loader tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat rubber tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t650 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t770 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t590 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t550 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t190 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat t66 tracks', language: 'en', group: 'tracks' },
  { keyword: 'bobcat mt85 tracks', language: 'en', group: 'tracks' },
  { keyword: 'cat 259d tracks', language: 'en', group: 'tracks' },
  { keyword: 'cat 289d tracks', language: 'en', group: 'tracks' },
  { keyword: 'kubota svl75 tracks', language: 'en', group: 'tracks' },
  { keyword: 'kubota svl65 tracks', language: 'en', group: 'tracks' },
  { keyword: 'kubota svl95 tracks', language: 'en', group: 'tracks' },
  { keyword: 'takeuchi tl8 tracks', language: 'en', group: 'tracks' },
  { keyword: 'case tr270 tracks', language: 'en', group: 'tracks' },
  { keyword: 'case tr310 tracks', language: 'en', group: 'tracks' },
  { keyword: 'case tv370 tracks', language: 'en', group: 'tracks' },
  { keyword: 'case tv450 tracks', language: 'en', group: 'tracks' },
  { keyword: 'john deere 333g tracks', language: 'en', group: 'tracks' },
  { keyword: 'john deere 325g tracks', language: 'en', group: 'tracks' },
  { keyword: 'jcb rubber tracks', language: 'en', group: 'tracks' },
  { keyword: 'jcb 1cxt tracks', language: 'en', group: 'tracks' },
  { keyword: 'jcb 150t tracks', language: 'en', group: 'tracks' },
  { keyword: 'jcb 190t tracks', language: 'en', group: 'tracks' },
  // Chargers
  { keyword: 'forklift charger module repair', language: 'en', group: 'charger' },
  { keyword: '6la20671', language: 'en', group: 'charger' },
  { keyword: 'hyster 4092995 charger', language: 'en', group: 'charger' },
  { keyword: 'forklift battery charger module', language: 'en', group: 'charger' },
  { keyword: 'enersys battery charger', language: 'en', group: 'charger' },
  { keyword: 'hawker charger module', language: 'en', group: 'charger' },
  { keyword: 'act quantum charger module', language: 'en', group: 'charger' },
  { keyword: '81063577r', language: 'en', group: 'charger' },
  { keyword: '81063578r', language: 'en', group: 'charger' },
  { keyword: '81063658r', language: 'en', group: 'charger' },
];

type SnapshotRow = {
  keyword: string;
  group: string;
  language: string;
  position: number | null;
  url: string | null;
  topCompetitor: string;
};

async function checkKeyword(kw: TargetKeyword): Promise<SnapshotRow> {
  const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        keyword: kw.keyword,
        location_code: LOCATION_US,
        language_code: kw.language,
        depth: 100,
      },
    ]),
  });
  const data = await res.json();
  const items: Array<{ rank_absolute: number; domain?: string; url?: string; type: string }> =
    data?.tasks?.[0]?.result?.[0]?.items ?? [];

  const organic = items.filter((i) => i.type === 'organic');
  const hit = organic.find((i) => i.domain?.replace(/^www\./, '') === DOMAIN);
  const top = organic[0];

  return {
    keyword: kw.keyword,
    group: kw.group,
    language: kw.language,
    position: hit?.rank_absolute ?? null,
    url: hit?.url?.replace(`https://www.${DOMAIN}`, '') ?? null,
    topCompetitor: top?.domain ?? 'n/a',
  };
}

async function main() {
  const rows: SnapshotRow[] = [];
  for (const kw of KEYWORDS) {
    try {
      rows.push(await checkKeyword(kw));
      process.stderr.write('.');
    } catch (err) {
      process.stderr.write('x');
      rows.push({
        keyword: kw.keyword,
        group: kw.group,
        language: kw.language,
        position: null,
        url: null,
        topCompetitor: `error: ${(err as Error).message}`,
      });
    }
  }
  process.stderr.write('\n');

  const date = new Date().toISOString().split('T')[0];
  const outDir = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${date}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ date, domain: DOMAIN, rows }, null, 2));

  let currentGroup = '';
  console.log(`\nRank snapshot ${date} — ${DOMAIN} (Google US, top 100)\n`);
  for (const row of rows) {
    if (row.group !== currentGroup) {
      currentGroup = row.group;
      console.log(`— ${currentGroup} —`);
    }
    const pos = row.position ? `#${row.position}` : 'not in 100';
    console.log(
      `  ${row.keyword.padEnd(48)} ${pos.padStart(11)}  ${row.url ?? ''}  [top: ${row.topCompetitor}]`
    );
  }
  console.log(`\nSaved: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
