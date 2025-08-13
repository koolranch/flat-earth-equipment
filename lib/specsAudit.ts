export type Specs = { voltage?: number|null; current?: number|null; phase?: '1P'|'3P'|null; family?: string|null };

export function parseSpecsFromSlugAudit(slug: string): Specs {
  const s=(slug||'').toLowerCase();
  const v=s.match(/\b(24|36|48|80)\s*v\b/); 
  const a=s.match(/\b(\d{2,3})\s*a\b/); 
  const fam=s.match(/green(2|4|6|8|x)\b/);
  let phase: '1P'|'3P'|null=null; 
  const family=fam?`green${fam[1]}`:null;
  if (family==='green2'||family==='green4') phase='1P'; 
  if (family==='green6'||family==='green8'||family==='greenx') phase='3P';
  return { voltage:v?Number(v[1]):null, current:a?Number(a[1]):null, phase, family };
}

export function bucketKey(s:Specs){ 
  return `${s.voltage??'?'}V|${s.current??'?'}A|${s.phase??'?'}|${s.family??'?'}`; 
}

export function withinPct(target?: number|null, actual?: number|null, tol=15){ 
  if(!target||!actual) return false; 
  return Math.abs((actual-target)/target)*100<=tol; 
}

export function ampsFor(voltage:number, speed:'overnight'|'fast'){ 
  const map:Record<number,number>={24:600,36:750,48:750,80:1000}; 
  const ah=map[voltage]; 
  const den=speed==='overnight'?10:5; 
  return ah?Math.max(10,Math.round(ah/den)):null; 
}
