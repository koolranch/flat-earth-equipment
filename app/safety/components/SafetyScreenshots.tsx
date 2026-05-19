import ScreenshotCard from './ScreenshotCard';
import type { MarketingDict } from '@/i18n';

const SUPABASE_STORAGE_URL = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets';

export default function SafetyScreenshots({ t }: { t: MarketingDict }) {
  const copy = t.safety.screenshots;
  return (
    <section aria-labelledby="proof-heading" className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white -z-10" />
      
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-orange-600 tracking-wide uppercase mb-3">{copy.eyebrow}</p>
        <h2 id="proof-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{copy.title}</h2>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">{copy.sub}</p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* 1) Dashboard - spans full width on md */}
        <div className="md:col-span-2 max-w-3xl mx-auto w-full">
          <ScreenshotCard
            src={`${SUPABASE_STORAGE_URL}/safety-dashboard.jpg`}
            alt={copy.cards[0].alt}
            caption={copy.cards[0].caption}
            badge={copy.cards[0].badge}
            badgeColor="orange"
            maxHeight="max-h-[560px]"
          />
        </div>

        {/* 2) Interactive Module */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-module.jpg`}
          alt={copy.cards[1].alt}
          caption={copy.cards[1].caption}
          badge={copy.cards[1].badge}
          badgeColor="blue"
          maxHeight="max-h-[520px]"
        />

        {/* 3) Certificate */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-certificate.jpg`}
          alt={copy.cards[2].alt}
          caption={copy.cards[2].caption}
          badge={copy.cards[2].badge}
          badgeColor="emerald"
          maxHeight="max-h-[520px]"
        />
      </div>
    </section>
  );
}
