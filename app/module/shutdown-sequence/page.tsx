import { cookies } from 'next/headers';
import StandardDemoPanel from '@/components/demos/StandardDemoPanel';
import MiniShutdown from '@/components/demos/MiniShutdown';
import GuidesPanel from '@/components/guides/GuidesPanel';
import QuizGate from '@/components/module/QuizGate';

// Local translation helper for server components
const L = (k: string, locale: 'en' | 'es') => {
  const en: any = { 
    'module.intro': 'Learn proper forklift shutdown and securing procedures.',
    'demo.title': 'Shutdown Sequence — Interactive Checklist',
    'demo.objective': 'Practice the correct shutdown sequence and fuel-specific procedures.',
    'guides.title': 'Quick Reference Guides',
    'guides.description': 'Shutdown procedures and safety protocols.',
    'quiz.title': 'Knowledge Check',
    'quiz.description': '4 questions about shutdown procedures and safety. Pass with 80% or higher.'
  };
  const es: any = { 
    'module.intro': 'Aprende los procedimientos adecuados de apagado y aseguramiento de montacargas.',
    'demo.title': 'Secuencia de Apagado — Lista Interactiva',
    'demo.objective': 'Practica la secuencia correcta de apagado y procedimientos específicos del combustible.',
    'guides.title': 'Guías de Referencia Rápida',
    'guides.description': 'Procedimientos de apagado y protocolos de seguridad.',
    'quiz.title': 'Verificación de Conocimiento',
    'quiz.description': '4 preguntas sobre procedimientos de apagado y seguridad. Aprobar con 80% o más.'
  };
  return (locale === 'es' ? es : en)[k] || k;
};

export default async function ShutdownSequencePage() {
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';

  return (
    <main className="container mx-auto p-4 space-y-6">
      
      {/* Module Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Shutdown Sequence
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {L('module.intro', locale)}
        </p>
        <p className="text-sm text-slate-500">
          Master the proper shutdown sequence and fuel-specific procedures to ensure safe forklift operation.
        </p>
      </header>

      {/* Interactive Demo Section */}
      <section>
        <StandardDemoPanel
          moduleSlug="shutdown-sequence"
          title={L('demo.title', locale)}
          objective={L('demo.objective', locale)}
          estMin={6}
        >
          <MiniShutdown locale={locale} moduleSlug="shutdown-sequence" />
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
        <GuidesPanel slug="shutdown-sequence" />
      </section>

      {/* Quiz Section */}
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {L('quiz.title', locale)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {L('quiz.description', locale)}
            </p>
          </div>
          <QuizGate slug="shutdown-sequence" moduleId="5" />
        </div>
      </section>
    </main>
  );
}
