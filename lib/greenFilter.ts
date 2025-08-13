export const GREEN_FAMILIES = ['green2','green4','green6','green8','greenx'] as const;

export type GreenFamily = typeof GREEN_FAMILIES[number];

export function isGreenSlug(slug?: string){ 
  if(!slug) return false; 
  const s = slug.toLowerCase(); 
  return s.startsWith('green') || /\bgreen(2|4|6|8|x)\b/.test(s); 
}

export function isGreenName(name?: string){ 
  if(!name) return false; 
  return /\bgreen\b/.test(name.toLowerCase()); 
}

export function filterGreen<T extends { slug?: string; name?: string }>(rows: T[]): T[]{ 
  return rows.filter(r => isGreenSlug(r.slug) || isGreenName(r.name)); 
}
