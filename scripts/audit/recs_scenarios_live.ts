/* Full 24-scenario sweep against live API; writes CSV. */
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function ampsFor(v: number, speed: 'overnight' | 'fast') {
  const map: Record<number, number> = { 24: 600, 36: 750, 48: 750, 80: 1000 };
  const ah = map[v];
  const den = speed === 'overnight' ? 10 : 5;
  return ah ? Math.max(10, Math.round(ah / den)) : null;
}

async function post(body: any) {
  const r = await fetch(`${BASE}/api/recommend-chargers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

(async () => {
  const volts = [24, 36, 48, 80] as const;
  const speeds = ['overnight', 'fast'] as const;
  const phases: ('1P' | '3P' | null)[] = ['1P', '3P', null];
  const rows: any[] = [];
  const header = ['voltage', 'speed', 'phase', 'target_amps', 'total', 'best', 'alt', 'first_slug'];

  for (const v of volts) {
    for (const sp of speeds) {
      const amps = ampsFor(v, sp as any);
      for (const ph of phases) {
        const j = await post({ voltage: v, amps, phase: ph, limit: 12 });
        const items = (j?.items) || [];
        const best = items.filter((i: any) => i.matchType === 'best');
        const alt = items.filter((i: any) => i.matchType !== 'best');
        rows.push([v, sp, ph ?? '—', amps, items.length, best.length, alt.length, items[0]?.slug || '']);
      }
    }
  }

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync(
    path.join('reports', 'recs_scenarios_live.csv'),
    [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  );
  console.log('Wrote reports/recs_scenarios_live.csv');
})();
