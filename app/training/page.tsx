import 'server-only';
import { cookies } from 'next/headers';
import { getCourseProgress } from '@/lib/learner/progress.server';
import { getDict, tFrom, type Locales } from '@/lib/i18n';

export default async function Page({ searchParams }: { searchParams?: Record<string,string> }) {
  const courseId = searchParams?.courseId || '';
  if (!courseId) return <main className='container mx-auto p-4'>Provide ?courseId=...</main>;
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const dict = getDict(locale as Locales);
  const t = (path: string, params?: Record<string, any>) => tFrom(dict, path, params);
  const prog = await getCourseProgress(courseId);
  
  // Check exam access conditions
  const bypass = process.env.EXAM_TEST_BYPASS === '1';
  const canTakeExam = prog.canTakeExam;
  
  return (
    <main className='container mx-auto p-4'>
      <header className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-[#0F172A]'>{t('training.hub_title')}</h1>
          <div className='min-w-[140px]'>
            <div className='text-xs text-slate-600'>{t('training.progress_label')}: {prog.pct}%</div>
            <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-2 bg-[#F76511]' style={{ width: `${prog.pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="mb-3">
        <a href="/orientation" className="inline-flex rounded-2xl border px-3 py-2 text-sm">{t('common.start')}</a>
      </div>

      <section className='mt-4 space-y-3'>
        {prog.next ? (
          <a className='inline-flex items-center justify-center rounded-2xl bg-[#F76511] text-white px-4 py-3 shadow-lg' href={prog.next.nextRoute}>
            {t('training.resume_training')}
          </a>
        ) : <div className='text-sm text-emerald-700'>{t('training.continue')}</div>}

        {/* Module Progress Overview */}
        <div className='rounded-2xl border p-4'>
          <h2 className='text-lg font-semibold text-[#0F172A] mb-3'>{t('training.module')}s</h2>
          <div className='space-y-2'>
            {prog.modules.map(module => (
              <div key={module.slug} className='flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-800'>
                <div className='flex items-center gap-2'>
                  <span className={`text-sm ${module.quiz_passed ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {module.quiz_passed ? '✅' : '⭕'}
                  </span>
                  <span className={`text-sm ${module.quiz_passed ? 'text-emerald-800 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                    {module.title}
                  </span>
                </div>
                {!module.quiz_passed && (
                  <a 
                    className='rounded-xl border border-[#F76511] text-[#F76511] px-3 py-1 text-sm hover:bg-[#F76511] hover:text-white transition-colors' 
                    href={module.route}
                  >
                    {t('common.start')}
                  </a>
                )}
              </div>
            ))}
          </div>
          
          {prog.stepsLeft.length > 0 && (
            <div className='mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200'>
              <p className='text-sm text-amber-800'>
                <strong>{prog.stepsLeft.length} modules remaining</strong> — {t('training.modules_complete_to_unlock_exam')}
              </p>
            </div>
          )}
        </div>

        {/* Final Exam CTA */}
        <article className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <header className="mb-2">
            <h3 className="text-lg font-semibold">{t('training.final_exam')}</h3>
            <p className="text-sm text-slate-600">{t('training.pass_to_generate_cert')}</p>
            {!canTakeExam && (
              <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                <span>🔒</span>
                {t('training.modules_complete_to_unlock_exam')}
              </p>
            )}
            {bypass && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <span>🧪</span>
                Test mode: Exam unlocked for testing purposes.
              </p>
            )}
          </header>
          {canTakeExam ? (
            <a 
              href="/training/exam" 
              className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0F] transition-colors"
            >
              {t('training.final_exam')}
            </a>
          ) : (
            <button 
              disabled
              className="inline-flex rounded-2xl border border-slate-300 text-slate-500 px-4 py-2 opacity-60 cursor-not-allowed"
              aria-label="Final exam locked until all modules are completed"
            >
              🔒 {t('common.locked')}
            </button>
          )}
        </article>

        {/* Supervisor Practical Evaluation CTA */}
        <section className="mt-4 rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{t('eval.title')}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('eval.competencies')}</p>
            </div>
            <a href="/practical/start" className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">{t('common.start')}</a>
          </div>
        </section>
      </section>
    </main>
  );
}