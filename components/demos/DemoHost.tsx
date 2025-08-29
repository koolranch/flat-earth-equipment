'use client';
import MiniPPE from '@/components/games/module1/MiniPPE';
import MiniInspection from '@/components/games/module2/MiniInspection';
import MiniShutdown from '@/components/demos/MiniShutdown';
import HazardSpotting from '@/components/demos/HazardSpotting';

// Registry mapping module slugs to demo components
const REGISTRY: Record<string, React.FC<{locale:'en'|'es'; moduleSlug?: string}>[]> = {
  'pre-operation-inspection': [
    ({ locale, moduleSlug }) => <MiniPPE locale={locale} moduleSlug={moduleSlug} />
  ],
  'eight-point-inspection': [
    ({ locale, moduleSlug }) => <MiniInspection locale={locale} moduleSlug={moduleSlug} />
  ],
  'balance-load-handling': [
    // Placeholder until MiniBalance is implemented
    ({ locale, moduleSlug }) => <div className="text-center py-8 text-slate-600">Balance demo coming soon...</div>
  ],
  'hazard-hunt': [
    ({ locale, moduleSlug }) => <HazardSpotting locale={locale} moduleSlug={moduleSlug} />
  ],
  'shutdown-sequence': [
    ({ locale, moduleSlug }) => <MiniShutdown locale={locale} moduleSlug={moduleSlug} />
  ]
};

export default function DemoHost({ moduleSlug, locale }: { moduleSlug: string; locale: 'en'|'es' }){
  const demos = REGISTRY[moduleSlug] || [];
  
  return (
    <div className='space-y-4'>
      {demos.length ? demos.map((Demo, i) => (
        <div key={i} className='rounded-2xl border p-4 md:p-6 shadow-lg bg-white dark:bg-slate-900 dark:border-slate-700'>
          {/* Pass moduleSlug down for analytics/progress */}
          <Demo locale={locale} moduleSlug={moduleSlug} />
        </div>
      )) : (
        <div className='rounded-2xl border p-4 md:p-6 shadow-lg bg-white dark:bg-slate-900 dark:border-slate-700'>
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            No demos available for this module yet.
          </div>
        </div>
      )}
    </div>
  );
}
