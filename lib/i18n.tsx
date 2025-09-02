// Re-export from the new typed i18n system
export { I18nProvider, useI18n } from './i18n/I18nProvider';
export { getDict, tFrom, dictionaries } from './i18n/index';
export type { Locales, Dict } from './i18n/index';

// Backward compatibility
export const useT = () => {
  const { t } = require('./i18n/I18nProvider').useI18n();
  return t;
};
