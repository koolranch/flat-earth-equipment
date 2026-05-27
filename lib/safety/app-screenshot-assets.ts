import type { Locale } from '@/i18n';

export type AppScreenshotKey = 'dashboard' | 'module' | 'outcome';

const APP_SCREENSHOT_PATHS: Record<Locale, Record<AppScreenshotKey, string>> = {
  en: {
    dashboard: '/media/safety/app/en/dashboard.png',
    module: '/media/safety/app/en/module.png',
    outcome: '/media/safety/app/en/outcome.png',
  },
  es: {
    dashboard: '/media/safety/app/es/dashboard.png',
    module: '/media/safety/app/es/module.png',
    outcome: '/media/safety/app/es/outcome.png',
  },
};

export function getAppScreenshotPath(locale: Locale, key: AppScreenshotKey): string {
  return APP_SCREENSHOT_PATHS[locale][key];
}
