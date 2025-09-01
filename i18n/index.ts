import marketingEn from './marketing.en';
import marketingEs from './marketing.es';
import trainerHelpEn from './help.trainer.en';
import trainerHelpEs from './help.trainer.es';

export type Locale = 'en' | 'es';

// Marketing page translations
export function getMarketingDict(locale: Locale) {
  return locale === 'es' ? marketingEs : marketingEn;
}

// Trainer help page translations
export function getTrainerHelpDict(locale: Locale) {
  return locale === 'es' ? trainerHelpEs : trainerHelpEn;
}

// Generic dictionary loader
export function getDict<T>(dictionaries: Record<Locale, T>, locale: Locale): T {
  return dictionaries[locale] || dictionaries.en;
}

// Type exports for better TypeScript support
export type MarketingDict = typeof marketingEn;
export type TrainerHelpDict = typeof trainerHelpEn;
