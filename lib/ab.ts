'use client';
import Cookies from 'js-cookie';

export type Variant = 'cta_top'|'cta_inline'|'cta_sidebar';
const KEY = 'fe_ab_cta';

export function getCtaVariant(): Variant{
  if (typeof window === 'undefined') return 'cta_inline'; // SSR fallback
  
  const existing = Cookies.get(KEY) as Variant | undefined;
  if (existing) return existing;
  
  const random = Math.random();
  const v: Variant = (random < 0.34) ? 'cta_top' : (random < 0.67 ? 'cta_inline' : 'cta_sidebar');
  Cookies.set(KEY, v, { expires: 30 });
  return v;
}
