import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'https://flatearthequipment.com';

type Speed = 'overnight' | 'fast';
function ampsFor(v: number, speed: Speed) {
  const ah: Record<number, number> = { 24: 600, 36: 750, 48: 750, 80: 1000 };
  const den = speed === 'overnight' ? 10 : 5; // ~C/10 or ~C/5
  return Math.max(10, Math.round((ah[v] || 0) / den));
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
  return { ok: r.ok, status: r.status, json: j };
}

(async () => {
  // 1) Health
  const health = await getHealth();

  // 2) Quick smoke (3 core cases)
  const smokeCases = [
    { voltage: 36, speed: 'overnight' as Speed, phase: '1P' },
    { voltage: 48, speed: 'overnight' as Speed, phase: '1P' },
    { voltage: 80, speed: 'overnight' as Speed, phase: '3P' }
  ];
  const smokeOut: string[] = [];
  for (const c of smokeCases) {
    const amps = ampsFor(c.voltage, c.speed);
    const res = await postRec({ voltage: c.voltage, amps, phase: c.phase, limit: 12 });
    const items: any[] = res.json?.items || [];
    const best = items.filter(i => i.matchType === 'best');
    smokeOut.push(`${c.voltage}V ${c.speed} ${c.phase} → total:${items.length} best:${best.length} top:${items[0]?.slug || '-'}`);
  }

  // 3) Full 24-scenario sweep
  const volts = [24, 36, 48, 80] as const;
  const speeds: Speed[] = ['overnight', 'fast'];
  const phases: ("1P" | "3P" | null)[] = ['1P', '3P', null];

  const rows: string[] = [];
  const header = ['voltage', 'speed', 'phase', 'target_amps', 'total', 'best', 'alt', 'first_slug'];
  rows.push(header.join(','));

  let zeroTotal = 0, zeroBest = 0;
  for (const v of volts) {
    for (const s of speeds) {
      const amps = ampsFor(v, s);
      for (const p of phases) {
        const res = await postRec({ voltage: v, amps, phase: p, limit: 12 });
        const items: any[] = res.json?.items || [];
        const best = items.filter(i => i.matchType === 'best');
        const alt = items.filter(i => i.matchType !== 'best');
        if (items.length === 0) zeroTotal++;
        if (best.length === 0) zeroBest++;
        rows.push([v, s, p ?? '—', amps, items.length, best.length, alt.length, items[0]?.slug || ''].join(','));
      }
    }
  }

  // Save CSV + MD
  fs.mkdirSync('reports', { recursive: true });
  const csvPath = path.join('reports', 'recs_scenarios_live.csv');
  fs.writeFileSync(csvPath, rows.join('\n'));

  const md = [
    `# Live Recommendations Report`,
    `Base URL: ${BASE}`,
    `\n## Health`,
    '```json',
    JSON.stringify(health, null, 2),
    '```',
    `\n## Smoke (3 core cases)`,
    ...smokeOut.map(s => `- ${s}`),
    `\n## Summary`,
    `- Cases: ${volts.length * speeds.length * phases.length}`,
    `- Zero TOTAL: ${zeroTotal}`,
    `- Zero BEST: ${zeroBest}`,
    `\n## CSV`,
    `Saved: ${csvPath}`
  ].join('\n');
  const mdPath = path.join('reports', 'recs_report_live.md');
  fs.writeFileSync(mdPath, md);

  // Console (pasteable)
  console.log('Health:', health);
  console.log('Smoke:', smokeOut);
  console.log('Summary:', { cases: volts.length * speeds.length * phases.length, zeroTotal, zeroBest });
  console.log('CSV:', csvPath);
  console.log('MD :', mdPath);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
