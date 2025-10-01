'use client';
import { useEffect, useState, Suspense } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { flags } from '@/lib/flags';
import PrelaunchBanner from '@/components/PrelaunchBanner';
import * as Sentry from '@sentry/nextjs';
import { FORKLIFT_MODULES_FALLBACK } from '@/lib/courses';
import { HeaderProgress } from '@/components/training/HeaderProgress';
import type { CourseModule } from '@/lib/progress';

type Progress = {
  pct: number;
  canTakeExam: boolean;
  next?: { nextRoute: string; label?: string };
  modules: Array<{ slug: string; title: string; route: string; quiz_passed: boolean; order?: number }>;
  stepsLeft: Array<any>;
  completedCount?: number;
  totalCount?: number;
};

type RecertStatus = {
  has_certificate: boolean;
  due: boolean;
  current_until?: string;
  last_issued_at?: string;
};

function TrainingContent({ courseId, resumeHref, course, modules, resumeOrder }: { 
  courseId: string; 
  resumeHref?: string;
  course?: any;
  modules?: any[];
  resumeOrder?: number;
}) {
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
    // If we have server-side modules, use them directly
    if (modules && modules.length > 0) {
      console.log('✅ Using server-side modules:', modules);
      const formattedModules = modules.map((m: any) => ({
        slug: m.content_slug || `module-${m.order}`,
        title: m.title,
        route: m.href,
        quiz_passed: false // Default to not passed, will be updated by progress API if available
      }));
      
      setProg({
        pct: 0,
        canTakeExam: false,
        modules: formattedModules,
        stepsLeft: formattedModules
      });
      setLoading(false);
      return;
    }

    if (!courseId) return;
    (async () => {
      try {
        console.log('🔍 Fetching progress for courseId:', courseId);
        const r = await fetch(`/api/training/progress?courseId=${encodeURIComponent(courseId)}`, { 
          credentials: 'include', 
          cache: 'no-store' 
        });
        console.log('📡 Progress API response status:', r.status);
        
        if (r.ok) {
          const data = await r.json();
          console.log('✅ Progress data received:', data);
          
          // Debug: Log module completion status
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Module completion status:', data.modules?.map((m: any) => ({
              id: m.slug,
              title: m.title,
              quiz_passed: m.quiz_passed,
              status: m.status
            })));
          }
          
          setProg(data);
        } else {
          const errorText = await r.text();
          console.error('❌ Progress API error:', r.status, errorText);
          
          // Log to Sentry but don't block the UI
          try {
            Sentry.captureException(new Error(`Progress API ${r.status}: ${errorText}`), { 
              tags: { area: 'training-progress' }, 
              extra: { courseId, status: r.status, response: errorText } 
            });
          } catch {}
          
          // Use fallback modules instead of empty array
          const formattedFallback = FORKLIFT_MODULES_FALLBACK.map((m: any) => ({
            slug: m.key,
            title: m.title,
            route: m.href,
            quiz_passed: false
          }));
          
          setProg({
            pct: 0,
            canTakeExam: false,
            modules: formattedFallback,
            stepsLeft: formattedFallback
          });
        }
      } catch (e) {
        console.error('❌ Progress fetch error:', e);
        
        // Log to Sentry but don't block the UI
        try {
          Sentry.captureException(e, { 
            tags: { area: 'training-progress' }, 
            extra: { courseId } 
          });
        } catch {}
        
        // Use fallback modules instead of empty array
        const formattedFallback = FORKLIFT_MODULES_FALLBACK.map((m: any) => ({
          slug: m.key,
          title: m.title,
          route: m.href,
          quiz_passed: false
        }));
        
        setProg({
          pct: 0,
          canTakeExam: false,
          modules: formattedFallback,
          stepsLeft: formattedFallback
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, modules]);

  if (!courseId) return <main id="main" className='container mx-auto p-4'>Provide ?courseId=...</main>;
  if (loading) return <main id="main" className='container mx-auto p-4' aria-busy="true">Loading...</main>;
  
  // Always render the UI, even if progress failed to load (with safe defaults)
  if (!prog) {
    setProg({
      pct: 0,
      canTakeExam: false,
      modules: [],
      stepsLeft: []
    });
    return <main id="main" className='container mx-auto p-4' aria-busy="true">Loading...</main>;
  }

  const canTakeExam = prog.canTakeExam;
  
  return (
    <main id="main" className='section' role="main" aria-label="Training Hub">
      <div className="container mx-auto px-4">
        <header className='panel shadow-card px-6 py-6 mb-8'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-orangeBright/80 mb-1">Flat Earth Safety</p>
              <h1 className='text-display font-semibold text-brand-onPanel mb-2'>Forklift Operator Training</h1>
              <p className="text-brand-onPanel/70 text-sm">Complete all modules and pass the final exam to earn your certificate</p>
            </div>
            <HeaderProgress 
              modules={prog.modules
                ?.filter(m => {
                  // Only include the 5 main training modules (not intro/completion)
                  const order = m.order || 0;
                  const title = m.title || '';
                  return order > 0 && !title.includes('Introduction') && !title.includes('Course Completion');
                })
                .map(m => ({ 
                  id: m.slug, 
                  title: m.title, 
                  quiz_passed: m.quiz_passed 
                }))} 
              fallbackPercent={prog.pct} 
            />
          </div>
        </header>

      {!flags.GA && <PrelaunchBanner />}

        {recert && !dismissed && recert.has_certificate && (
          <div className={`rounded-2xl border p-4 mb-6 ${recert.due ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
            <div className="flex items-start gap-3">
              <div className="text-base leading-7">
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
                className="ml-auto rounded-xl border px-3 py-2 text-sm hover:bg-white/20 transition-colors tappable" 
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

        {/* Feature-gated Buy/Claim CTAs */}
        {flags.GA ? (
          <div className="mb-6 flex flex-wrap gap-3">
            <a href="/checkout" className="btn-primary tappable">Buy seat</a>
            {flags.SHOW_INVITES && (
              <a href="/training/claim" className="tappable rounded-xl border border-brand-onPanel/20 px-4 py-2 text-brand-onPanel/90 hover:bg-white/5 transition-colors">Have a code?</a>
            )}
          </div>
        ) : (
          <div className="mb-6 panel-soft px-4 py-3 rounded-xl">
            <p className="text-brand-onPanel/90 text-sm">Purchasing opens soon. Training preview is available.</p>
          </div>
        )}

        <section className='space-y-6'>
          {prog.next && (
            <div className="text-center">
              <a className='btn-primary tappable inline-flex items-center justify-center' href={prog.next.nextRoute} aria-label={`Resume training: ${prog.next.label || 'next module'}`}>
                Resume training
              </a>
            </div>
          )}

          {/* Module Progress Overview */}
          <div className='panel-soft shadow-card px-6 py-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-semibold text-brand-onPanel'>Training Modules</h2>
              {prog.completedCount !== undefined && prog.totalCount !== undefined && (
                <div className='text-sm text-brand-onPanel/70'>
                  <span className='font-semibold text-brand-onPanel'>{prog.completedCount}/{prog.totalCount}</span> complete
                </div>
              )}
            </div>
            <div className='space-y-3'>
              {/* Filter out intro and completion modules, show only training content */}
              {(prog.modules && prog.modules.length > 0 ? prog.modules : FORKLIFT_MODULES_FALLBACK)
                .filter((module: any) => {
                  const title = module.title || '';
                  const order = module.order || 0;
                  // Only show actual training modules (not intro or completion)
                  return order > 0 && !title.includes('Introduction') && !title.includes('Course Completion');
                })
                .map((module, idx) => {
                const isAPIModule = prog.modules && prog.modules.length > 0;
                const title = isAPIModule ? (module as any).title : (module as any).title;
                const href = isAPIModule ? (module as any).route : (module as any).href;
                const completed = isAPIModule ? (module as any).quiz_passed : false;
                const key = isAPIModule ? (module as any).slug : (module as any).key;
                
                return (
                  <div key={key} className='flex items-center justify-between p-4 rounded-xl bg-brand-onPanel/5 border border-brand-onPanel/10 hover:border-brand-onPanel/20 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <span className={`text-xl ${completed ? 'text-emerald-400' : 'text-brand-onPanel/40'}`}>
                        {completed ? '✓' : '○'}
                      </span>
                      <div>
                        <span className={`text-base font-medium ${completed ? 'text-brand-onPanel/60' : 'text-brand-onPanel'}`}>
                          {title}
                        </span>
                        {completed && (
                          <div className="text-xs text-emerald-400 mt-1">✓ Completed</div>
                        )}
                      </div>
                    </div>
                    <a 
                      className={`tappable text-sm px-4 py-2 rounded-lg transition-colors ${
                        completed 
                          ? 'border border-brand-onPanel/20 text-brand-onPanel/70 hover:bg-brand-onPanel/5' 
                          : 'btn-primary'
                      }`}
                      href={href}
                      aria-label={completed ? `Review ${title}` : `Start ${title} module`}
                    >
                      {completed ? 'Review' : 'Start'}
                    </a>
                  </div>
                );
              })}
            </div>
            
            {prog.stepsLeft && prog.stepsLeft.length > 0 && (
              <div className='mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20'>
                <p className='text-base leading-7 text-amber-300'>
                  <strong>{prog.stepsLeft.length} {prog.stepsLeft.length === 1 ? 'module' : 'modules'} remaining</strong> — Complete all modules to unlock the exam
                </p>
              </div>
            )}
            
            {prog.stepsLeft && prog.stepsLeft.length === 0 && prog.totalCount && prog.totalCount > 0 && (
              <div className='mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20'>
                <p className='text-base leading-7 text-emerald-300'>
                  <strong>🎉 All modules complete!</strong> You can now take the final exam.
                </p>
              </div>
            )}
          </div>

          {/* Final Exam CTA */}
          <article className="panel shadow-card px-6 py-6">
            <header className="mb-4">
              <h3 className="text-2xl font-semibold text-brand-onPanel mb-2">Final Exam</h3>
              <p className="text-base leading-7 text-brand-onPanel/90">Pass to generate certificate</p>
              {!canTakeExam && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-300 flex items-center gap-2">
                    <span>🔒</span>
                    Complete all modules to unlock the exam
                  </p>
                </div>
              )}
            </header>
            {canTakeExam ? (
              <a 
                href="/training/exam" 
                className="btn-primary tappable"
              >
                Take Final Exam
              </a>
            ) : (
              <button 
                disabled
                className="tappable rounded-xl border border-brand-onPanel/20 text-brand-onPanel/50 px-4 py-2 opacity-60 cursor-not-allowed"
                aria-label="Final exam locked until all modules are completed"
              >
                🔒 Locked
              </button>
            )}
          </article>

          {/* Supervisor Practical Evaluation CTA */}
          <section className="panel shadow-card px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-brand-onPanel mb-2">Practical Evaluation</h2>
                <p className="text-base leading-7 text-brand-onPanel/90">Competencies assessment with your supervisor</p>
              </div>
              <a href="/practical/start" className="btn-primary tappable">Start</a>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export default function TrainingHub({ 
  courseId, 
  resumeHref, 
  course, 
  modules, 
  resumeOrder 
}: { 
  courseId: string;
  resumeHref?: string;
  course?: any;
  modules?: any[];
  resumeOrder?: number;
}) {
  return (
    <Suspense fallback={<main className='container mx-auto p-4'>Loading...</main>}>
      <TrainingContent 
        courseId={courseId} 
        resumeHref={resumeHref}
        course={course}
        modules={modules}
        resumeOrder={resumeOrder}
      />
    </Suspense>
  );
}
