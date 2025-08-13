export type Specs = { voltage?: number|null; amperage?: number|null; phase?: '1P'|'3P'|null; family?: string|null };
export function parseFromText(slug:string, name?:string, description?:string): Specs {
  const s = `${slug||''} ${name||''} ${description||''}`.toLowerCase();
  // Support 24/36/48/80/96V and 2–3 digit amps (20A..300A), variants: amp/amps/ampere
  const v = s.match(/\b(24|36|48|80|96)\s*v\b/);
  const a = s.match(/\b(\d{2,3})\s*a(?:mps?|mp|mpere|mpers)?\b/);
  const fam = s.match(/green(2|4|6|8|x)\b/);
  const family = fam ? `green${fam[1]}` : null;
  let phase: '1P'|'3P'|null = null;
  if (family==='green2'||family==='green4') phase='1P';
  if (family==='green6'||family==='green8'||family==='greenx') phase='3P';
  return { voltage: v?Number(v[1]):null, amperage: a?Number(a[1]):null, phase, family };
}
export function withinPct(target?: number|null, actual?: number|null, tolPct=15){ if(!target||!actual) return false; const d=Math.abs((actual-target)/target)*100; return d<=tolPct; }