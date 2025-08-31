import { cookies } from 'next/headers';
import StandardDemoPanel from '@/components/demos/StandardDemoPanel';
import StabilityLite from '@/components/demos/StabilityLite';
import GuidesPanel from '@/components/guides/GuidesPanel';
import QuizGate from '@/components/module/QuizGate';

// Local translation helper for server components
const L = (k: string, locale: 'en' | 'es') => {
  const en: any = { 
    'module.intro': 'Learn stability principles through hands-on practice.',
    'demo.title': 'Balance & Load Handling — Interactive Demo',
    'demo.objective': 'Master the stability triangle and load capacity principles.',
    'guides.title': 'Quick Reference Guides',
    'guides.description': 'Key stability and load handling procedures.',
    'quiz.title': 'Knowledge Check',
    'quiz.description': '5 questions about stability and load handling. Pass with 80% or higher.'
  };
  const es: any = { 
    'module.intro': 'Aprende principios de estabilidad a través de práctica práctica.',
    'demo.title': 'Balance y Manejo de Carga — Demo Interactiva',
    'demo.objective': 'Domina el triángulo de estabilidad y principios de capacidad de carga.',
    'guides.title': 'Guías de Referencia Rápida',
    'guides.description': 'Procedimientos clave de estabilidad y manejo de carga.',
    'quiz.title': 'Verificación de Conocimiento',
    'quiz.description': '5 preguntas sobre estabilidad y manejo de carga. Aprobar con 80% o más.'
  };
  return (locale === 'es' ? es : en)[k] || k;
};

export default async function BalanceLoadHandlingPage() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';

  return (
    <main className="container mx-auto p-4 space-y-6">
      
      {/* Module Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Balance &amp; Load Handling
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {L('module.intro', locale)}
        </p>
        <p className="text-sm text-slate-500">
          Understand how weight, height, and load center affect forklift stability and safety.
        </p>
      </header>

      {/* Interactive Demo Section */}
      <section>
        <StandardDemoPanel
          moduleSlug="balance-load-handling"
          title={L('demo.title', locale)}
          objective={L('demo.objective', locale)}
          estMin={10}
        >
          <StabilityLite />
        </StandardDemoPanel>
      </section>

      {/* Quick Reference Guides */}
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {L('guides.title', locale)}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {L('guides.description', locale)}
          </p>
        </div>
        <GuidesPanel slug="balance-load-handling" />
      </section>

      {/* Quiz Section */}
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {L('quiz.title', locale)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {L('quiz.description', locale)}
            </p>
          </div>
          <QuizGate slug="balance-load-handling" moduleId="3" />
        </div>
      </section>

      {/* Module Navigation */}
      <section className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500">
          Module 3 of 4 • Est. 10 minutes
        </div>
        <div className="space-x-3">
          <a 
            href="/training" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Back to Training Hub
          </a>
          <a 
            href="/module/hazard-hunt" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Next Module →
          </a>
        </div>
      </section>
    </main>
  );
}
