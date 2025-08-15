import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function ampsFor(v: number, speed: 'overnight' | 'fast') {
  const map: Record<number, number> = { 24: 600, 36: 750, 48: 750, 80: 1000 };
  const ah = map[v];
  const den = speed === 'overnight' ? 10 : 5;
  return ah ? Math.max(10, Math.round(ah / den)) : null;
}

async function getHealth() {
  const r = await fetch(`${BASE}/api/recommend-chargers`);
  if (!r.ok) throw new Error(`Health HTTP ${r.status}`);
  return r.json();
}

async function postRec(body: any) {
  const r = await fetch(`${BASE}/api/recommend-chargers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body, json: j };
}

(async () => {
  const volts = [24, 36, 48, 80] as const;
  const speeds = ['overnight', 'fast'] as const;
  const phases: ('1P' | '3P' | null)[] = ['1P', '3P', null];
  const rows: string[] = [];
  const header = ['voltage', 'speed', 'phase', 'target_amps', 'total', 'best', 'alt', 'top_slug'];
  rows.push(header.join(','));

  const health = await getHealth();
  const cases: { voltage: number; speed: 'overnight' | 'fast'; phase: '1P' | '3P' | null }[] = [];
  for (const v of volts) {
    for (const s of speeds) {
      for (const p of phases) {
        cases.push({ voltage: v, speed: s as any, phase: p });
      }
    }
  }

  let zeroTotal = 0, zeroBest = 0;
  const highlights: string[] = [];
  for (const c of cases) {
    const amps = ampsFor(c.voltage, c.speed)!;
    const res = await postRec({ voltage: c.voltage, amps, phase: c.phase, limit: 12 });
    const items: any[] = res.json?.items || [];
    const best = items.filter(i => i.matchType === 'best');
    const alt = items.filter(i => i.matchType !== 'best');
    if (items.length === 0) zeroTotal++;
    if (best.length === 0) zeroBest++;
    rows.push([c.voltage, c.speed, c.phase ?? '—', amps, items.length, best.length, alt.length, items[0]?.slug || ''].join(','));
    
    // record four core scenarios for console highlight
    if ((c.voltage === 36 && c.speed === 'overnight' && c.phase === '1P') ||
        (c.voltage === 48 && c.speed === 'overnight' && c.phase === '1P') ||
        (c.voltage === 80 && c.speed === 'overnight' && c.phase === '3P') ||
        (c.voltage === 48 && c.speed === 'fast' && c.phase === '3P')) {
      highlights.push(`${c.voltage}V ${c.speed} ${c.phase ?? '—'} → total:${items.length} best:${best.length} top:${items[0]?.slug || '-'}`);
    }
  }

  fs.mkdirSync('reports', { recursive: true });
  const csvPath = path.join('reports', 'recs_scenarios_live.csv');
  fs.writeFileSync(csvPath, rows.join('\n'));

  const md = [
    `# Live Recs Report`,
    `Base URL: ${BASE}`,
    `\n## Health`,
    '```json',
    JSON.stringify(health, null, 2),
    '```',
    `\n## Summary`,
    `- Cases: ${cases.length}`,
    `- Zero TOTAL: ${zeroTotal}`,
    `- Zero BEST: ${zeroBest}`,
    `\n## Core Scenario Highlights`,
    ...highlights.map(h => `- ${h}`),
    `\n## CSV`,
    `Saved: reports/recs_scenarios_live.csv`
  ].join('\n');
  const mdPath = path.join('reports', 'recs_report_live.md');
  fs.writeFileSync(mdPath, md);

  // Console summary (paste this back to ChatGPT)
  console.log('Health:', health);
  console.log('Summary:', { cases: cases.length, zeroTotal, zeroBest });
  console.log('Core:', highlights);
  console.log('CSV:', csvPath);
  console.log('MD :', mdPath);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
