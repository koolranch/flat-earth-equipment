import DynamicQuiz from '@/components/quiz/DynamicQuiz';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Quiz page wrapper that uses DynamicQuiz component
 * DynamicQuiz handles fetching locale-appropriate content automatically
 */
export default async function QuizPage({ params }: { params: { slug: string } }) {
  // Get locale for any server-side logic
  const cookieLoc = cookies().get('locale')?.value || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  const locale = ['en', 'es'].includes(cookieLoc) ? cookieLoc as 'en' | 'es' : 'en';

  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Module Quiz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Test your knowledge. Pass with 80% or higher.
        </p>
      </header>

      <section>
        <DynamicQuiz 
          slug={params.slug} 
          locale={locale}
          onComplete={() => {
            // Optional: Handle completion at page level
            console.log(`Quiz ${params.slug} completed`);
          }}
        />
      </section>

      <footer className="text-center space-y-2">
        <div className="space-x-3">
          <a 
            href="/training" 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Back to Training Hub
          </a>
          <a 
            href={`/module/${params.slug}`} 
            className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
          >
            Review Module
          </a>
        </div>
        
        <div className="text-xs text-slate-500">
          Quiz: {params.slug} | Locale: {locale}
        </div>
      </footer>
    </main>
  );
}
