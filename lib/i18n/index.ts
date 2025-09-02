import { en } from './locales/en';
import { es } from './locales/es';

export type Locales = 'en'|'es';
export const dictionaries = { en, es } as const;
export type Dict = typeof en; // keys shared across locales

export function getDict(locale: Locales): Dict {
  return (dictionaries[locale] || dictionaries.en) as Dict;
}

// dot-path lookup: t('exam.title')
export function tFrom(dict: Dict, path: string, params?: Record<string, string|number>) {
  const parts = path.split('.');
  let cur: any = dict;
  for (const p of parts) cur = cur?.[p];
  if (cur == null) return path; // fallback to key
  let out = String(cur);
  if (params) for (const [k,v] of Object.entries(params)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}
