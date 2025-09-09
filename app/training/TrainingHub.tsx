'use client';
import { useEffect, useState, Suspense } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { flags } from '@/lib/flags';
import PrelaunchBanner from '@/components/PrelaunchBanner';

type Progress = {
  pct: number;
  canTakeExam: boolean;
  next?: { nextRoute: string; label?: string };
  modules: Array<{ slug: string; title: string; route: string; quiz_passed: boolean }>;
  stepsLeft: Array<any>;
};

type RecertStatus = {
  has_certificate: boolean;
  due: boolean;
  current_until?: string;
  last_issued_at?: string;
};

function TrainingContent({ courseId }: { courseId: string }) {
  const { t } = useI18n();
  const [prog, setProg] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [recert, setRecert] = useState<RecertStatus | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => { 
    const d = localStorage.getItem('recert_banner_dismissed'); 
    setDismissed(d === '1'); 
  }, []);

  useEffect(() => { 
    (async () => { 
      try { 
        const r = await fetch('/api/recert/eligibility'); 
        if (r.ok) { 
          setRecert(await r.json()); 
        } 
      } catch {} 
    })(); 
  }, []);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        console.log('🔍 Fetching progress for courseId:', courseId);
        const r = await fetch(`/api/training/progress?courseId=${encodeURIComponent(courseId)}`);
        console.log('📡 Progress API response status:', r.status);
        
        if (r.ok) {
          const data = await r.json();
          console.log('✅ Progress data received:', data);
          setProg(data);
        } else {
          const errorText = await r.text();
          console.error('❌ Progress API error:', r.status, errorText);
        }
      } catch (e) {
        console.error('❌ Progress fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  if (!courseId) return <main id="main" className='container mx-auto p-4'>Provide ?courseId=...</main>;
  if (loading) return <main id="main" className='container mx-auto p-4' aria-busy="true">Loading...</main>;
  if (!prog) return <main id="main" className='container mx-auto p-4'>Failed to load progress.</main>;

  const canTakeExam = prog.canTakeExam;
  
  return (
    <main id="main" className='container mx-auto p-4' role="main" aria-label="Training Hub">
      <header className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-[#0F172A]'>Forklift Operator Training</h1>
          <div className='min-w-[140px]'>
            <div className='text-xs text-slate-600'>Progress: {prog.pct}%</div>
            <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-2 bg-[#F76511]' style={{ width: `${prog.pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      {!flags.GA && <PrelaunchBanner />}

      {recert && !dismissed && recert.has_certificate && (
        <div className={`rounded-2xl border p-3 ${recert.due ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
          <div className="flex items-start gap-3">
            <div className="text-sm">
              {recert.due ? (
                <>
                  {t('hub.recert_due')}
                </>
              ) : (
                <>
                  {t('hub.recert_current', { date: new Date(recert.current_until || '').toLocaleDateString() })}
                </>
              )}
            </div>
            <button 
              className="ml-auto rounded-xl border px-2 py-1 text-xs" 
              onClick={() => { 
                localStorage.setItem('recert_banner_dismissed', '1'); 
                setDismissed(true); 
              }}
            >
              {t('common.dismiss')}
            </button>
          </div>
        </div>
      )}

      <div className="mb-3">
        <a href="/orientation" className="inline-flex rounded-2xl border px-3 py-2 text-sm">Start</a>
      </div>

      {/* Feature-gated Buy/Claim CTAs */}
      {flags.GA ? (
        <div className="mt-4 flex gap-3">
          <a href="/checkout" className="btn btn-primary rounded-2xl">Buy seat</a>
          {flags.SHOW_INVITES && (
            <a href="/training/claim" className="btn btn-ghost rounded-2xl">Have a code?</a>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-600">Purchasing opens soon. Training preview is available.</div>
      )}

      <section className='mt-4 space-y-3'>
        {prog.next ? (
          <a className='btn inline-flex items-center justify-center bg-[#F76511] text-white shadow-lg' href={prog.next.nextRoute} aria-label={`Resume training: ${prog.next.label || 'next module'}`}>
            Resume training
          </a>
        ) : <div className='text-sm text-emerald-700'>Continue</div>}

        {/* Module Progress Overview */}
        <div className='rounded-2xl border p-4'>
          <h2 className='text-lg font-semibold text-[#0F172A] mb-3'>Modules</h2>
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
                    className='btn border border-[#F76511] text-[#F76511] text-sm hover:bg-[#F76511] hover:text-white transition-colors' 
                    href={module.route}
                    aria-label={`Start ${module.title} module`}
                  >
                    Start
                  </a>
                )}
              </div>
            ))}
          </div>
          
          {prog.stepsLeft.length > 0 && (
            <div className='mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200'>
              <p className='text-sm text-amber-800'>
                <strong>{prog.stepsLeft.length} modules remaining</strong> — Complete all modules to unlock the exam
              </p>
            </div>
          )}
        </div>

        {/* Final Exam CTA */}
        <article className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <header className="mb-2">
            <h3 className="text-lg font-semibold">Final Exam</h3>
            <p className="text-sm text-slate-600">Pass to generate certificate</p>
            {!canTakeExam && (
              <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                <span>🔒</span>
                Complete all modules to unlock the exam
              </p>
            )}
          </header>
          {canTakeExam ? (
            <a 
              href="/training/exam" 
              className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg hover:bg-[#E55A0F] transition-colors"
            >
              Final Exam
            </a>
          ) : (
            <button 
              disabled
              className="inline-flex rounded-2xl border border-slate-300 text-slate-500 px-4 py-2 opacity-60 cursor-not-allowed"
              aria-label="Final exam locked until all modules are completed"
            >
              🔒 Locked
            </button>
          )}
        </article>

        {/* Supervisor Practical Evaluation CTA */}
        <section className="mt-4 rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Practical Evaluation</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Competencies</p>
            </div>
            <a href="/practical/start" className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">Start</a>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function TrainingHub({ courseId }: { courseId: string }) {
  return (
    <Suspense fallback={<main className='container mx-auto p-4'>Loading...</main>}>
      <TrainingContent courseId={courseId} />
    </Suspense>
  );
}
