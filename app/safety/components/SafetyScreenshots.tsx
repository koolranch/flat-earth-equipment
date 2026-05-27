import ScreenshotCard from './ScreenshotCard';
import type { Locale, MarketingDict } from '@/i18n';
import { getAppScreenshotPath } from '@/lib/safety/app-screenshot-assets';

export default function SafetyScreenshots({
  t,
  locale = 'en',
  compact = false,
}: {
  t: MarketingDict;
  locale?: Locale;
  compact?: boolean;
}) {
  const copy = t.safety.screenshots;

  return (
    <section
      aria-labelledby="proof-heading"
      className={`relative mx-auto w-full max-w-6xl px-4 ${compact ? 'py-10 sm:py-12' : 'py-16 sm:py-20'}`}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50/50 to-white" />

      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-600">{copy.eyebrow}</p>
        <h2 id="proof-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {copy.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{copy.sub}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
        <div className="mx-auto w-full max-w-sm md:col-span-2 md:max-w-md">
          <ScreenshotCard
            variant="phone"
            src={getAppScreenshotPath(locale, 'dashboard')}
            alt={copy.cards[0].alt}
            caption={copy.cards[0].caption}
            badge={copy.cards[0].badge}
            badgeColor="orange"
          />
        </div>

        <ScreenshotCard
          variant="phone"
          src={getAppScreenshotPath(locale, 'module')}
          alt={copy.cards[1].alt}
          caption={copy.cards[1].caption}
          badge={copy.cards[1].badge}
          badgeColor="blue"
        />

        <ScreenshotCard
          variant="phone"
          src={getAppScreenshotPath(locale, 'outcome')}
          alt={copy.cards[2].alt}
          caption={copy.cards[2].caption}
          badge={copy.cards[2].badge}
          badgeColor="emerald"
        />
      </div>
    </section>
  );
}
