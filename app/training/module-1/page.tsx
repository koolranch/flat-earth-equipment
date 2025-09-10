'use client';
import React from 'react';
import PPESequence from '@/components/demos/module1/PPESequence';
import ControlsHotspots from '@/components/demos/module1/ControlsHotspots';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SafeLoader from '@/components/common/SafeLoader';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { StatusDot } from '@/components/training/StatusDot';
import { FlashDeck } from '@/components/training/FlashDeck';
import flashData from '@/content/training/forklift-operator/module-1/preop-flashcards.json';
import { track } from '@/lib/track';

export default function Page() {
  // New tab-based state management
  const [tab, setTab] = React.useState<'osha'|'practice'|'flash'|'quiz'>('osha');
  const [ppeDone, setPpeDone] = React.useState(false);
  const [ctrlDone, setCtrlDone] = React.useState(false);
  const [flashTouched, setFlashTouched] = React.useState(false);
  const [quizPassed, setQuizPassed] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);
  
  React.useEffect(() => { track('lesson_start', { module: 1 }); }, []);

  // Persist state for preview sessions
  React.useEffect(() => {
    try {
      const key = 'm1-main-preview';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.ppeDone) setPpeDone(true);
      if (saved.ctrlDone) setCtrlDone(true);
      if (saved.flashTouched) setFlashTouched(true);
      if (saved.quizPassed) setQuizPassed(true);
    } catch {}
  }, []);
  
  React.useEffect(() => {
    try {
      const key = 'm1-main-preview';
      localStorage.setItem(key, JSON.stringify({ ppeDone, ctrlDone, flashTouched, quizPassed }));
    } catch {}
  }, [ppeDone, ctrlDone, flashTouched, quizPassed]);

  const practiceDone = ppeDone && ctrlDone;
  const prereqsMet = practiceDone && flashTouched;

  async function markModuleComplete() {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          module: 1, 
          kind: 'lesson_complete', 
          quiz_passed: true,
          completed_at: new Date().toISOString()
        })
      });
    } catch {}
  }

  React.useEffect(() => {
    if (quizPassed) markModuleComplete();
  }, [quizPassed]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 1 — Pre-Operation</h1>
        <p className="text-slate-600">Equip PPE and complete basic safety checks before you move the truck.</p>
      </header>

      {/* Tabs: OSHA → Practice → Flash → Quiz */}
      <div className='flex gap-2 mb-4'>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='osha'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('osha')}
        >
          OSHA Basics <StatusDot state={practiceDone||flashTouched||quizPassed ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='practice'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('practice')}
        >
          Practice <StatusDot state={practiceDone ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='flash'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => { setTab('flash'); setFlashTouched(true); }}
        >
          Flash Cards <StatusDot state={flashTouched ? 'done':'todo'} />
        </button>
        <button
          className={`px-3 py-1.5 rounded-md border ${tab==='quiz'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'} ${!prereqsMet && 'opacity-50 cursor-not-allowed'}`}
          onClick={() => prereqsMet && setTab('quiz')}
          aria-disabled={!prereqsMet}
        >
          Quiz <StatusDot state={quizPassed ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
        </button>
      </div>

      {/* Panels */}
      {tab==='osha' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">OSHA 1910.178 — Pre-Operation Requirements</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-900">Daily Inspection Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                Powered industrial trucks must be inspected at least daily and when used on each shift.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Safety Requirements:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Remove trucks from service if any condition adversely affects safety</li>
                <li>• Verify the <strong>data plate</strong> matches the truck and any attachments in use</li>
                <li>• Wear <strong>seatbelts</strong> and required <strong>PPE</strong> as posted</li>
                <li>• Test <strong>horn</strong> before moving; use at intersections and blind corners</li>
                <li>• Confirm <strong>lights</strong>/beacons work where required</li>
                <li>• Check tires, forks, chains, hydraulics, and look for leaks</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                <em>This is a plain-language summary to help you pass and operate safely. Always follow your site policy and the manufacturer's manual.</em>
              </p>
            </div>
          </div>
        </section>
      )}

      {tab==='practice' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <div className="space-y-6">
            <ErrorBoundary>
              <SafeLoader label="Loading PPE…">
                <PPESequence onComplete={() => setPpeDone(true)} />
              </SafeLoader>
            </ErrorBoundary>
            <ErrorBoundary>
              <SafeLoader label="Loading controls…">
                <ControlsHotspots onComplete={() => setCtrlDone(true)} />
              </SafeLoader>
            </ErrorBoundary>
            {practiceDone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">✅ Practice section completed!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <FlashDeck cards={(flashData as any).cards || []} />
          <div className='text-xs text-slate-500 mt-2'>Tip: open each card once before taking the quiz.</div>
        </section>
      )}

      {tab==='quiz' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          {!prereqsMet ? (
            <div className='text-sm text-slate-600'>
              <p className='mb-2 flex items-center gap-2'><span>🔒</span> The quiz unlocks after:</p>
              <ul className='list-disc ml-6 space-y-1'>
                <li>Complete the Practice section (PPE + Controls)</li>
                <li>Open the Flash Cards</li>
              </ul>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Module 1 Quiz</h3>
                <p className='text-sm text-slate-600'>8 questions · pass ≥ 80%</p>
              </div>
              <button className='px-4 py-2 rounded-md border bg-blue-600 text-white border-blue-600' onClick={() => setShowQuiz(true)}>Take quiz</button>
            </div>
          )}
        </section>
      )}

      {/* Footer CTA */}
      <div className='mt-6 flex justify-end'>
        <button
          className={`px-4 py-2 rounded-md border ${quizPassed ? 'bg-blue-600 text-white border-blue-600' : 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'}`}
          disabled={!quizPassed}
          onClick={() => {
            window.location.href = '/training/module-2';
          }}
        >
          {quizPassed ? 'Continue to Module 2' : 'Complete all steps to continue'}
        </button>
      </div>

      {/* Quiz modal */}
      {showQuiz && (
        <SimpleQuizModal 
          module={1} 
          onClose={() => setShowQuiz(false)} 
          onPassed={async (score) => {
            track('lesson_complete', { module: 1, score });
            setQuizPassed(true);
            setShowQuiz(false);
          }} 
        />
      )}
    </main>
  );
}
