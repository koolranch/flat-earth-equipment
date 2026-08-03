/**
 * Phase 1 competitive demand audit: Cloud Electric (FSIP peer) vs Flat Earth.
 *
 * Pulls DataForSEO Labs:
 *  1) relevant_pages — their traffic-driving URLs
 *  2) ranked_keywords — their organic keyword footprint
 *  3) domain_intersection (intersections:false) — keywords they rank for that we don't
 *
 * Usage: npx tsx scripts/seo/cloudelectric-gap-audit.ts
 * Output: scripts/seo/rank-snapshots/cloudelectric-gap-YYYY-MM-DD.json
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LOGIN = process.env.DATAFORSEO_LOGIN!;
const PASSWORD = process.env.DATAFORSEO_PASSWORD!;
const LOCATION_US = 2840;
const AUTH = 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');

const COMPETITOR = 'cloudelectric.com';
const US = 'flatearthequipment.com';

async function dfsPost(endpoint: string, task: Record<string, unknown>) {
  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: AUTH,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([task]),
  });
  const data = await res.json();
  const taskResult = data?.tasks?.[0];
  if (!taskResult || taskResult.status_code !== 20000) {
    console.error(`API error on ${endpoint}:`, JSON.stringify(data, null, 2).slice(0, 2000));
    throw new Error(`${endpoint} failed: ${taskResult?.status_message ?? 'unknown'}`);
  }
  return {
    cost: data.cost as number,
    result: taskResult.result?.[0] ?? null,
  };
}

type OrganicMetrics = {
  etv?: number;
  count?: number;
  pos_1?: number;
  pos_2_3?: number;
  pos_4_10?: number;
  estimated_paid_traffic_cost?: number;
};

function categorize(text: string): string {
  const t = text.toLowerCase();
  if (/\b(charger|chargers|chargeplus|lester|delta.?q|schauer|elcon|signet|quick.?charge)\b/.test(t))
    return 'chargers';
  if (/\b(charger.?board|charger.?module|control.?board|pcb)\b/.test(t)) return 'charger-modules';
  if (/\b(controller|curtis|alltrax|sepex|navitas|sevcon|pg.?drives)\b/.test(t)) return 'controllers';
  if (/\b(lithium|lifepo4|forklift.?batter|golf.?cart.?batter|battery.?pack)\b/.test(t))
    return 'batteries';
  if (/\b(motor|series.?wound|sep.?ex.?motor|traction.?motor)\b/.test(t)) return 'motors';
  if (/\b(contactor|solenoid|reversing.?contactor)\b/.test(t)) return 'contactors';
  if (/\b(throttle|accelerator|potentiometer|hall.?effect)\b/.test(t)) return 'throttles';
  if (/\b(dc.?dc|converter|voltage.?reducer)\b/.test(t)) return 'dc-dc';
  if (/\b(display|gauge|hour.?meter|battery.?indicator|soc)\b/.test(t)) return 'gauges-displays';
  if (/\b(fuse|jjn|class.?t|limiter)\b/.test(t)) return 'fuses';
  if (/\b(joystick|tiller|handle)\b/.test(t)) return 'joysticks';
  if (/\b(conversion|upgrade|kit)\b/.test(t)) return 'conversion-kits';
  if (/\b(golf.?cart|club.?car|ezgo|ez.?go|yamaha.?drive)\b/.test(t)) return 'golf-cart';
  if (/\b(test.?equipment|programmer|handheld)\b/.test(t)) return 'test-equipment';
  if (/\b(rebuilt|reman|repair)\b/.test(t)) return 'rebuilt-reman';
  return 'other';
}

async function main() {
  if (!LOGIN || !PASSWORD) {
    console.error('Missing DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD in .env.local');
    process.exit(1);
  }

  let totalCost = 0;

  console.log('1/3 relevant_pages…');
  const pagesRes = await dfsPost('dataforseo_labs/google/relevant_pages/live', {
    target: COMPETITOR,
    location_code: LOCATION_US,
    language_code: 'en',
    item_types: ['organic'],
    limit: 100,
    order_by: ['metrics.organic.etv,desc'],
  });
  totalCost += pagesRes.cost ?? 0;

  const pages = (pagesRes.result?.items ?? []).map(
    (item: { page_address?: string; metrics?: { organic?: OrganicMetrics } }) => {
      const url = item.page_address ?? '';
      const m = item.metrics?.organic ?? {};
      return {
        url,
        etv: m.etv ?? 0,
        keywords: m.count ?? 0,
        pos_1: m.pos_1 ?? 0,
        pos_2_3: m.pos_2_3 ?? 0,
        pos_4_10: m.pos_4_10 ?? 0,
        traffic_value: m.estimated_paid_traffic_cost ?? 0,
        category: categorize(url),
      };
    }
  );

  console.log('2/3 ranked_keywords…');
  const kwRes = await dfsPost('dataforseo_labs/google/ranked_keywords/live', {
    target: COMPETITOR,
    location_code: LOCATION_US,
    language_code: 'en',
    item_types: ['organic'],
    limit: 200,
    order_by: ['keyword_data.keyword_info.search_volume,desc'],
    filters: ['keyword_data.keyword_info.search_volume', '>', 10],
  });
  totalCost += kwRes.cost ?? 0;

  const ranked = (kwRes.result?.items ?? []).map(
    (item: {
      keyword_data?: {
        keyword?: string;
        keyword_info?: {
          search_volume?: number;
          cpc?: number;
          competition?: number;
          competition_level?: string;
        };
        keyword_properties?: { keyword_difficulty?: number };
        search_intent_info?: { main_intent?: string };
      };
      ranked_serp_element?: {
        serp_item?: {
          url?: string;
          rank_absolute?: number;
          etv?: number;
          title?: string;
        };
      };
    }) => {
      const kd = item.keyword_data ?? {};
      const serp = item.ranked_serp_element?.serp_item ?? {};
      const keyword = kd.keyword ?? '';
      return {
        keyword,
        volume: kd.keyword_info?.search_volume ?? 0,
        cpc: kd.keyword_info?.cpc ?? 0,
        competition: kd.keyword_info?.competition_level ?? null,
        difficulty: kd.keyword_properties?.keyword_difficulty ?? null,
        intent: kd.search_intent_info?.main_intent ?? null,
        position: serp.rank_absolute ?? null,
        etv: serp.etv ?? 0,
        url: serp.url ?? '',
        title: serp.title ?? '',
        category: categorize(`${keyword} ${serp.url ?? ''} ${serp.title ?? ''}`),
      };
    }
  );

  console.log('3/3 domain_intersection gap (them yes / us no)…');
  const gapRes = await dfsPost('dataforseo_labs/google/domain_intersection/live', {
    target1: COMPETITOR,
    target2: US,
    location_code: LOCATION_US,
    language_code: 'en',
    intersections: false,
    item_types: ['organic'],
    limit: 300,
    order_by: ['keyword_data.keyword_info.search_volume,desc'],
    filters: ['keyword_data.keyword_info.search_volume', '>', 20],
  });
  totalCost += gapRes.cost ?? 0;

  const gaps = (gapRes.result?.items ?? []).map(
    (item: {
      keyword_data?: {
        keyword?: string;
        keyword_info?: {
          search_volume?: number;
          cpc?: number;
          competition_level?: string;
        };
        keyword_properties?: { keyword_difficulty?: number };
        search_intent_info?: { main_intent?: string };
      };
      first_domain_serp_element?: {
        url?: string;
        rank_absolute?: number;
        etv?: number;
        title?: string;
        type?: string;
      };
    }) => {
      const kd = item.keyword_data ?? {};
      const serp = item.first_domain_serp_element ?? {};
      const keyword = kd.keyword ?? '';
      return {
        keyword,
        volume: kd.keyword_info?.search_volume ?? 0,
        cpc: kd.keyword_info?.cpc ?? 0,
        competition: kd.keyword_info?.competition_level ?? null,
        difficulty: kd.keyword_properties?.keyword_difficulty ?? null,
        intent: kd.search_intent_info?.main_intent ?? null,
        position: serp.rank_absolute ?? null,
        etv: serp.etv ?? 0,
        url: serp.url ?? '',
        title: serp.title ?? '',
        category: categorize(`${keyword} ${serp.url ?? ''} ${serp.title ?? ''}`),
      };
    }
  );

  // Aggregate by category for gap keywords
  const byCategory: Record<
    string,
    { keywords: number; volume: number; etv: number; top: typeof gaps }
  > = {};
  for (const g of gaps) {
    const cat = g.category;
    if (!byCategory[cat]) byCategory[cat] = { keywords: 0, volume: 0, etv: 0, top: [] };
    byCategory[cat].keywords += 1;
    byCategory[cat].volume += g.volume;
    byCategory[cat].etv += g.etv;
    byCategory[cat].top.push(g);
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].top = byCategory[cat].top
      .sort((a, b) => b.volume * (b.cpc || 0.5) - a.volume * (a.cpc || 0.5))
      .slice(0, 15);
  }

  const categorySummary = Object.entries(byCategory)
    .map(([category, stats]) => ({
      category,
      keywords: stats.keywords,
      volume: stats.volume,
      etv: Math.round(stats.etv * 10) / 10,
      opportunity_score: Math.round(stats.volume + stats.etv * 5),
      top_keywords: stats.top.map((t) => ({
        keyword: t.keyword,
        volume: t.volume,
        cpc: t.cpc,
        position: t.position,
        intent: t.intent,
        url: t.url,
      })),
    }))
    .sort((a, b) => b.opportunity_score - a.opportunity_score);

  // Filter branded navigational noise
  const brandNoise = /cloud.?electric|cloudelectric|fsip\.com|tvh\.com/i;
  const buyIntentGaps = gaps
    .filter((g) => !brandNoise.test(g.keyword) && !brandNoise.test(g.url))
    .filter((g) => g.intent === 'transactional' || g.intent === 'commercial' || g.cpc >= 1)
    .filter((g) => (g.position ?? 100) <= 20)
    .sort((a, b) => b.volume * Math.max(b.cpc, 0.3) - a.volume * Math.max(a.cpc, 0.3))
    .slice(0, 50);

  const date = new Date().toISOString().split('T')[0];
  const out = {
    date,
    source: 'dataforseo-labs',
    competitor: COMPETITOR,
    us: US,
    location: 'US',
    cost_usd: totalCost,
    totals: {
      competitor_pages: pages.length,
      competitor_ranked_keywords_sample: ranked.length,
      gap_keywords: gaps.length,
      gap_total_count: gapRes.result?.total_count ?? gaps.length,
    },
    top_pages: pages.slice(0, 40),
    top_ranked_keywords: ranked.slice(0, 50),
    category_summary: categorySummary,
    buy_intent_gaps: buyIntentGaps,
    all_gaps_sample: gaps.slice(0, 100),
  };

  const outDir = path.resolve(process.cwd(), 'scripts/seo/rank-snapshots/cloudelectric');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${date}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));

  console.log(`\n=== Cloud Electric gap audit (${date}) — cost ~$${totalCost.toFixed(4)} ===\n`);
  console.log('Top pages by estimated traffic:');
  for (const p of pages.slice(0, 20)) {
    console.log(
      `  etv=${String(Math.round(p.etv)).padStart(6)}  kw=${String(p.keywords).padStart(4)}  [${p.category.padEnd(16)}] ${p.url}`
    );
  }

  console.log('\nGap categories (them yes / us no), by opportunity score:');
  for (const c of categorySummary) {
    console.log(
      `  ${c.category.padEnd(18)} score=${String(c.opportunity_score).padStart(6)}  kws=${String(c.keywords).padStart(3)}  vol=${String(c.volume).padStart(6)}  etv=${c.etv}`
    );
  }

  console.log('\nTop buy-intent gap keywords:');
  for (const g of buyIntentGaps.slice(0, 30)) {
    console.log(
      `  vol=${String(g.volume).padStart(5)}  cpc=$${(g.cpc ?? 0).toFixed(2).padStart(5)}  pos=${String(g.position ?? '-').padStart(3)}  [${g.category.padEnd(16)}] ${g.keyword}`
    );
  }

  console.log(`\nSaved: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
