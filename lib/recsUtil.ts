export type Speed = 'overnight' | 'fast';
export function assumedAh(voltage?: number|null){
  if(!voltage) return null; const map: Record<number, number> = {24:600,36:750,48:750,80:1000};
  return map[voltage] ?? null;
}
export function ampsFrom(voltage?: number|null, speed: Speed='overnight'){
  const ah = assumedAh(voltage); if(!ah) return null; const denom = speed==='overnight'?10:5; return Math.max(10, Math.round(ah/denom));
}
export function parseBool(v?: string|null){ return v==='1' || v==='true'; }
