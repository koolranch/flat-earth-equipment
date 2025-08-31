import { cookies } from 'next/headers';
import StandardDemoPanel from '@/components/demos/StandardDemoPanel';
import HazardHunt from '@/components/demos/HazardHunt';
import GuidesPanel from '@/components/guides/GuidesPanel';
import QuizGate from '@/components/module/QuizGate';

// Local translation helper for server components
const L = (k: string, locale: 'en' | 'es') => {
  const en: any = { 
    'module.intro': 'Develop hazard recognition and response skills.',
    'demo.title': 'Hazard Hunt — Interactive Challenge',
    'demo.objective': 'Identify workplace hazards and learn proper response procedures.',
    'guides.title': 'Quick Reference Guides',
    'guides.description': 'Hazard identification and response procedures.',
    'quiz.title': 'Knowledge Check',
    'quiz.description': '5 questions about hazard recognition and response. Pass with 80% or higher.'
  };
  const es: any = { 
    'module.intro': 'Desarrolla habilidades de reconocimiento y respuesta a peligros.',
    'demo.title': 'Caza de Peligros — Desafío Interactivo',
    'demo.objective': 'Identifica peligros en el lugar de trabajo y aprende procedimientos de respuesta adecuados.',
    'guides.title': 'Guías de Referencia Rápida',
    'guides.description': 'Procedimientos de identificación y respuesta a peligros.',
    'quiz.title': 'Verificación de Conocimiento',
    'quiz.description': '5 preguntas sobre reconocimiento y respuesta a peligros. Aprobar con 80% o más.'
  };
  return (locale === 'es' ? es : en)[k] || k;
};

export default async function HazardHuntPage() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';

  return (
    <main className="container mx-auto p-4 space-y-6">
      
      {/* Module Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Hazard Hunt
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {L('module.intro', locale)}
        </p>
        <p className="text-sm text-slate-500">
          Practice identifying common workplace hazards and learn the correct response for each situation.
        </p>
      </header>

      {/* Interactive Demo Section */}
      <section>
        <StandardDemoPanel
          moduleSlug="hazard-hunt"
          title={L('demo.title', locale)}
          objective={L('demo.objective', locale)}
          estMin={8}
        >
          <HazardHunt />
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
        <GuidesPanel slug="hazard-hunt" />
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
          <QuizGate slug="hazard-hunt" moduleId="4" />
        </div>
      </section>

      {/* Module Navigation */}
      <section className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500">
          Module 4 of 4 • Est. 8 minutes
        </div>
        <div className="space-x-3">
          <a 
            href="/module/balance-load-handling" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            ← Previous Module
          </a>
          <a 
            href="/training" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Back to Training Hub
          </a>
          <a 
            href="/final-exam" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Take Final Exam →
          </a>
        </div>
      </section>
    </main>
  );
}
