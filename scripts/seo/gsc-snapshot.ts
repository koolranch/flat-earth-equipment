/**
 * Google Search Console performance snapshot.
 *
 * - Pulls last-28-day query, page, and query+page rows for the
 *   sc-domain:flatearthequipment.com property via the Search Analytics API
 * - Writes dated JSON under scripts/seo/rank-snapshots/gsc/
 * - Prints totals, top pages, and CTR-opportunity queries
 *   (position 4-20, high impressions, weak CTR)
 *
 * Auth: reads the OAuth token from ~/.mcp-servers/gsc/token.json
 * (created by ~/.mcp-servers/gsc/reauth_gsc.py; override via GSC_TOKEN_PATH).
 * Free API — no per-call cost.
 *
 * Usage: npx tsx scripts/seo/gsc-snapshot.ts
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const SITE = 'sc-domain:flatearthequipment.com';
const TOKEN_PATH =
  process.env.GSC_TOKEN_PATH ?? path.join(os.homedir(), '.mcp-servers/gsc/token.json');
const OUT_DIR = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/gsc');
const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
// GSC data lags ~2-3 days behind real time
const LAG_DAYS = 3;
const WINDOW_DAYS = 28;

type GscRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SnapshotFile = {
  date: string;
  site: string;
  source: 'gsc-search-analytics';
  window: { startDate: string; endDate: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: GscRow[];
  pages: GscRow[];
  queryPages: GscRow[];
};

async function getAccessToken(): Promise<string> {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) as {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    token_uri?: string;
  };
  const res = await fetch(token.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: token.client_id,
      client_secret: token.client_secret,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function queryAnalytics(
  accessToken: string,
  body: Record<string, unknown>
): Promise<GscRow[]> {
  const res = await fetch(`${API_BASE}/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Search Analytics query failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { rows?: GscRow[] };
  return data.rows ?? [];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split('T')[0];
}

function pagePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

async function main() {
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error(`Missing GSC token at ${TOKEN_PATH}. Run ~/.mcp-servers/gsc/reauth_gsc.py first.`);
    process.exit(1);
  }

  const endDate = isoDaysAgo(LAG_DAYS);
  const startDate = isoDaysAgo(LAG_DAYS + WINDOW_DAYS - 1);
  const date = new Date().toISOString().split('T')[0];
  const accessToken = await getAccessToken();

  console.log(`GSC snapshot — ${SITE} — ${startDate} → ${endDate}\n`);

  const common = { startDate, endDate, type: 'web', dataState: 'final' };
  const [totalsRows, queries, pages, queryPages] = await Promise.all([
    queryAnalytics(accessToken, { ...common, rowLimit: 1 }),
    queryAnalytics(accessToken, { ...common, dimensions: ['query'], rowLimit: 1000 }),
    queryAnalytics(accessToken, { ...common, dimensions: ['page'], rowLimit: 1000 }),
    queryAnalytics(accessToken, { ...common, dimensions: ['query', 'page'], rowLimit: 5000 }),
  ]);

  const totals = totalsRows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  console.log(
    `Totals: ${totals.clicks} clicks · ${totals.impressions} impressions · CTR ${pct(totals.ctr)} · avg pos ${totals.position.toFixed(1)}\n`
  );

  console.log('Top 15 pages by clicks:');
  for (const p of pages.slice(0, 15)) {
    console.log(
      `  ${String(p.clicks).padStart(5)} clicks  ${String(p.impressions).padStart(7)} impr  pos ${p.position.toFixed(1).padStart(5)}  ${pagePath(p.keys[0])}`
    );
  }

  const opportunities = queryPages
    .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);
  console.log('\nCTR opportunities (pos 4-20, ≥100 impressions):');
  for (const r of opportunities) {
    console.log(
      `  ${String(r.impressions).padStart(7)} impr  ${String(r.clicks).padStart(4)} clicks  CTR ${pct(r.ctr).padStart(6)}  pos ${r.position.toFixed(1).padStart(5)}  "${r.keys[0]}" → ${pagePath(r.keys[1])}`
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${date}.json`);
  const payload: SnapshotFile = {
    date,
    site: SITE,
    source: 'gsc-search-analytics',
    window: { startDate, endDate },
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.ctr,
      position: totals.position,
    },
    queries,
    pages,
    queryPages,
  };
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log(`\nSaved: ${outFile}`);
  console.log(
    `Rows: ${queries.length} queries · ${pages.length} pages · ${queryPages.length} query+page`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
