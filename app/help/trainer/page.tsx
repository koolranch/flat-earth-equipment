import tEN from '@/i18n/help.trainer.en';
import tES from '@/i18n/help.trainer.es';
import LanguageToggle from '@/components/LanguageToggle';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: 'Trainer Help Guide | Flat Earth Safety',
  description: 'Complete guide for trainers to assign seats, evaluate practical skills, and export records.',
};

function getDict() {
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  return defaultLocale === 'es' ? tES : tEN;
}

export default function TrainerHelpPage() {
  const dict = getDict();

  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dict.title}</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">{dict.intro}</p>
        </div>
        <LanguageToggle />
      </header>

      {dict.sections.map((s: any, i: number) => (
        <section key={i} className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold">{s.h}</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{s.p}</p>
          {s.tips?.length ? (
            <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {s.tips.map((tip: string, j: number) => (
                <li key={j}>{tip}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <footer className="mt-8 text-center">
        <div className="inline-flex gap-3">
          <a 
            href="/trainer" 
            className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0C] transition-colors"
          >
            Go to Trainer Tools
          </a>
          <a 
            href="/training" 
            className="rounded-xl border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Training Hub
          </a>
        </div>
      </footer>
    </main>
  );
}