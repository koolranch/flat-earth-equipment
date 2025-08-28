'use client';
import MiniPPE from '@/components/games/module1/MiniPPE';
import MiniInspection from '@/components/games/module2/MiniInspection';
import MiniShutdown from '@/components/games/module5/MiniShutdown';

// Registry mapping module slugs to demo components
const REGISTRY: Record<string, React.FC<{locale:'en'|'es'}>[]> = {
  'pre-operation-inspection': [
    ({ locale }) => <MiniPPE onComplete={() => {}} openGuide={() => {}} />
  ],
  'eight-point-inspection': [
    ({ locale }) => <MiniInspection locale={locale} onComplete={() => {}} />
  ],
  'balance-load-handling': [
    // Placeholder until MiniBalance is implemented
    ({ locale }) => <div className="text-center py-8 text-slate-600">Balance demo coming soon...</div>
  ],
  'hazard-hunt': [
    // Placeholder until MiniHazard is implemented  
    ({ locale }) => <MiniInspection locale={locale} onComplete={() => {}} />
  ],
  'shutdown-sequence': [
    ({ locale }) => <MiniShutdown onComplete={() => {}} />
  ]
};

export default function DemoHost({ moduleSlug, locale }: { moduleSlug: string; locale: 'en'|'es' }){
  const demos = REGISTRY[moduleSlug] || [];
  
  return (
    <div className='space-y-4'>
      {demos.length ? demos.map((Demo, i) => (
        <div key={i} className='rounded-2xl border p-4 md:p-6 shadow-lg bg-white dark:bg-slate-900 dark:border-slate-700'>
          <Demo locale={locale} />
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
