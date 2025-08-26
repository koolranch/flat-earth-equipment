'use client';
import React, { createContext, useContext } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const DICTS: Record<string, any> = { en, es };

const I18nCtx = createContext<{ t: (k: string, f?: string) => string }>({ 
  t: (k, f) => f ?? k 
});

export function I18nProvider({ 
  children, 
  locale 
}: { 
  children: React.ReactNode; 
  locale?: string;
}) {
  const dict = DICTS[locale ?? process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en'] ?? en;
  const t = (k: string, f?: string) => (dict[k] ?? f ?? k);
  return <I18nCtx.Provider value={{ t }}>{children}</I18nCtx.Provider>;
}

export function useT() { 
  return useContext(I18nCtx).t; 
}
