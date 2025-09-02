'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDict, tFrom, Locales, Dict } from './index';

export const LOCALE_COOKIE = 'locale';

type Ctx = { locale: Locales; dict: Dict; t: (path:string, p?:Record<string,any>)=>string; setLocale: (l:Locales)=>void };
const I18nCtx = createContext<Ctx | null>(null);

function getInitialLocale(): Locales {
  if (typeof document !== 'undefined') {
    const cookieLocale = document.cookie.match(/(?:^|; )locale=([^;]+)/)?.[1];
    if (cookieLocale === 'en' || cookieLocale === 'es') return cookieLocale;
  }
  const envLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  return (envLocale === 'es' ? 'es' : 'en');
}

export function I18nProvider({ children, defaultLocale }:{ children: any; defaultLocale?: Locales }){
  const [locale, setLocaleState] = useState<Locales>(() => getInitialLocale());
  const dict = useMemo(()=> getDict(locale), [locale]);
  const t = (p:string, params?:Record<string,any>) => tFrom(dict, p, params);
  function setLocale(l:Locales){ document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60*60*24*365}`; setLocaleState(l); (window as any)?.analytics?.track?.('locale_changed', { locale:l }); }
  useEffect(()=>{ (window as any)?.analytics?.identify?.(undefined, { locale }); }, [locale]);
  return <I18nCtx.Provider value={{ locale, dict, t, setLocale }}>{children}</I18nCtx.Provider>;
}

export function useI18n(){
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}
