import MiniShutdown from './MiniShutdown';

// ShutdownChecklist is an alias for MiniShutdown to match the registry demoKey
export default function ShutdownChecklist({ locale, moduleSlug }: { locale: 'en'|'es'; moduleSlug?: string }) {
  return <MiniShutdown locale={locale} moduleSlug={moduleSlug} />;
}
