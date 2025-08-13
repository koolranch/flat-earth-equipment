export type Specs = { voltage?: number|null; current?: number|null; phase?: '1P'|'3P'|null; family?: string|null };
export function parseSpecsFromSlugSafe(slug: string): Specs {
  const s = (slug||'').toLowerCase();
  const v = s.match(/\b(24|36|48|80)\s*v\b/);
  const a = s.match(/\b(\d{2,3})\s*a\b/);
  const fam = s.match(/green(2|4|6|8|x)\b/);
  let phase: '1P'|'3P'|null = null;
  const family = fam ? `green${fam[1]}` : null;
  if (family === 'green2' || family === 'green4') phase = '1P';
  if (family === 'green6' || family === 'green8' || family === 'greenx') phase = '3P';
  return { voltage: v?Number(v[1]):null, current: a?Number(a[1]):null, phase, family };
}
export function withinPct(target?: number|null, actual?: number|null, tolPct=15){ if(!target||!actual) return false; const d=Math.abs((actual-target)/target)*100; return d<=tolPct; }
