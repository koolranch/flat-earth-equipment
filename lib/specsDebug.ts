export type Specs = { voltage?: number|null; current?: number|null; phase?: '1P'|'3P'|null; family?: string|null };

// Harden slug parsing: supports GREEN2/4/6/8/X and variants like green4-36v-70a, green-36v-70a, 36v-70a, etc.
export function parseSpecsFromSlugSafe(slug: string): Specs {
  const s = (slug || '').toLowerCase();
  const vMatch = s.match(/(24|36|48|80)\s*v/);
  const aMatch = s.match(/(\d{2,3})\s*a/);
  const famMatch = s.match(/green(2|4|6|8|x)/);
  // Phase is often NOT in slug; infer from family if possible
  let phase: '1P'|'3P'|null = null;
  const family = famMatch ? `green${famMatch[1]}` : null;
  if (family === 'green2' || family === 'green4') phase = '1P';
  if (family === 'green6' || family === 'green8' || family === 'greenx') phase = '3P';
  const voltage = vMatch ? Number(vMatch[1]) : null;
  const current = aMatch ? Number(aMatch[1]) : null;
  return { voltage, current, phase, family };
}

export function withinPct(target?: number|null, actual?: number|null, tolPct = 15) {
  if (!target || !actual) return false; const d = Math.abs((actual - target) / target) * 100; return d <= tolPct;
}
