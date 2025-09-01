import { cookies } from 'next/headers';
import { getTrainerHelpDict, type Locale } from '@/i18n';

export const dynamic = 'force-dynamic';

export default function TrainerHelpPage() {
  const locCookie = cookies().get('locale')?.value || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  const locale = ['en', 'es'].includes(locCookie) ? locCookie as Locale : 'en';
  
  const t = getTrainerHelpDict(locale);

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">{t.title}</h1>
        <p className="text-slate-600 mt-2">{t.intro}</p>
      </header>

      <div className="space-y-6">
        {t.sections.map((section, index) => (
          <section key={index} className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">{section.h}</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">{section.p}</p>
            
            {section.tips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 {locale === 'es' ? 'Consejos' : 'Tips'}
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-8 text-center">
        <div className="inline-flex gap-3">
          <a 
            href="/trainer" 
            className="rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0C] transition-colors"
          >
            {locale === 'es' ? 'Ir a herramientas' : 'Go to Trainer Tools'}
          </a>
          <a 
            href="/training" 
            className="rounded-xl border px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            {locale === 'es' ? 'Capacitación' : 'Training Hub'}
          </a>
        </div>
      </footer>
    </main>
  );
}
