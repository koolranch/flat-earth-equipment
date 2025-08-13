/* Node smoke test: runs common combinations and prints a summary table.
   Usage: BASE_URL=http://localhost:3000 ts-node scripts/tests/charger-selector-smoke.ts */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function ampsFrom(voltage: number, speed: 'overnight'|'fast'){
  const map: Record<number, number> = {24:600,36:750,48:750,80:1000};
  const ah = map[voltage]; const denom = speed==='overnight'?10:5; return Math.max(10, Math.round(ah/denom));
}

async function runOne(voltage: number, speed: 'overnight'|'fast', phase: '1P'|'3P'|null){
  const amps = ampsFrom(voltage, speed);
  const res = await fetch(`${BASE}/api/recommend-chargers`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ voltage, amps, phase, limit: 12 }) });
  const json = await res.json();
  const items = json?.items || [];
  const best = items.filter((i: any)=> i.matchType==='best');
  const alt  = items.filter((i: any)=> i.matchType!=='best');
  return { voltage, speed, phase: phase||'—', amps, total: items.length, best: best.length, alt: alt.length, bestSlugs: best.slice(0,3).map((i:any)=>i.slug).join(',') };
}

(async () => {
  const volts = [24,36,48,80] as const;
  const speeds = ['overnight','fast'] as const;
  const phases = ['1P','3P',null] as const;
  const rows:any[] = [];
  for(const v of volts){ for(const s of speeds){ for(const p of phases){ rows.push(await runOne(v,s,p)); } } }
  // print table
  const header = ['V','Speed','Phase','Amps','Total','Best','Alt','BestSlugs'];
  console.log(header.join('\t'));
  rows.forEach(r=> console.log([r.voltage, r.speed, r.phase, r.amps, r.total, r.best, r.alt, r.bestSlugs].join('\t')));
})();
