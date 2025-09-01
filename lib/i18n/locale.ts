export type Locale = 'en' | 'es';

export function getInitialLocale(): Locale {
  const cookie = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )locale=([^;]+)/)?.[1] : undefined;
  const env = process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale | undefined;
  return (cookie as Locale) || env || 'en';
}
