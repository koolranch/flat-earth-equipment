'use client';
import React from 'react';
import PPESequence from '@/components/demos/module1/PPESequence';
import ControlsHotspots from '@/components/demos/module1/ControlsHotspots';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SafeLoader from '@/components/common/SafeLoader';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { StatusDot } from '@/components/training/StatusDot';
import SwipeableFlashCards from '@/components/training/SwipeableFlashCards';
import InteractiveChecklist, { ChecklistItem } from '@/components/training/InteractiveChecklist';
import { getModuleFlashcards } from '@/lib/training/flashcards';
import { track } from '@/lib/track';
import { useModuleGate } from '@/components/training/useModuleGate';

// Force dynamic rendering and prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// OSHA Basics checklist items
const oshaChecklistItems: ChecklistItem[] = [
  {
    id: 'daily-inspection',
    title: 'Daily Inspection Required',
    description: 'Powered industrial trucks must be inspected at least daily and when used on each shift.',
    icon: '🔍'
  },
  {
    id: 'remove-unsafe',
    title: 'Remove Unsafe Trucks from Service',
    description: 'Remove trucks from service if any condition adversely affects safety.',
    icon: '🚨'
  },
  {
    id: 'data-plate',
    title: 'Verify Data Plate',
    description: 'Verify the data plate matches the truck and any attachments in use.',
    icon: '📋'
  },
  {
    id: 'ppe-seatbelt',
    title: 'Wear Seatbelts & Required PPE',
    description: 'Wear seatbelts and required PPE as posted for your site.',
    icon: '🦺'
  },
  {
    id: 'horn-test',
    title: 'Test Horn Before Moving',
    description: 'Test horn before moving; use at intersections and blind corners.',
    icon: '📢'
  },
  {
    id: 'lights-beacons',
    title: 'Confirm Lights/Beacons Work',
    description: 'Confirm lights/beacons work where required for visibility.',
    icon: '💡'
  },
  {
    id: 'physical-checks',
    title: 'Check Tires, Forks, Chains, Hydraulics',
    description: 'Check tires, forks, chains, hydraulics, and look for leaks.',
    icon: '🔧'
  }
];

export default function Page() {
  const [tab, setTab] = React.useState<'osha'|'practice'|'flash'|'quiz'>('osha');
  const [ppeDone, setPpeDone] = React.useState(false);
  const [ctrlDone, setCtrlDone] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);
  
  // Load saved progress from localStorage for Module 1
  const [loadedInitialState, setLoadedInitialState] = React.useState(false);
  const [initialGateState, setInitialGateState] = React.useState<any>({ 
    osha: false, practice: false, cards: false, quiz: false 
  });
  
  React.useEffect(() => {
    try {
      const key = 'm1-gate-state';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (Object.keys(saved).length > 0) {
        setInitialGateState(saved);
      }
      setLoadedInitialState(true);
    } catch {}
  }, []);
  
  // Use same progress tracking system as other modules
  const { done, markDone } = useModuleGate({
    courseId: 'forklift',
    moduleKey: 'm1',
    initial: initialGateState
  });
  
  // Persist gate state to localStorage
  React.useEffect(() => {
    if (loadedInitialState) {
      try {
        localStorage.setItem('m1-gate-state', JSON.stringify(done));
      } catch {}
    }
  }, [done, loadedInitialState]);
  
  React.useEffect(() => { track('lesson_start', { module: 1 }); }, []);

  const practiceDone = ppeDone && ctrlDone;
  const prereqsMet = done.osha && done.practice && done.cards;
  const quizPassed = done.quiz;

  async function markModuleComplete() {
    try {
      await markDone("quiz");
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
          OSHA Basics <StatusDot state={done.osha ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='practice'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('practice')}
        >
          Practice <StatusDot state={done.practice ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='flash'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('flash')}
        >
          Flash Cards <StatusDot state={done.cards ? 'done':'todo'} />
        </button>
        <button
          className={`px-3 py-1.5 rounded-md border ${tab==='quiz'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'} ${!prereqsMet && 'opacity-50 cursor-not-allowed'}`}
          onClick={() => prereqsMet && setTab('quiz')}
          aria-disabled={!prereqsMet}
        >
          Quiz <StatusDot state={done.quiz ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
        </button>
      </div>

      {/* Panels */}
      {tab==='osha' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <InteractiveChecklist
            title="OSHA 1910.178 — Pre-Operation Requirements"
            subtitle="Master essential safety checks before operating any forklift."
            items={oshaChecklistItems}
            requireAllChecked={true}
            onComplete={async () => {
              console.log('✅ OSHA checklist complete');
              await markDone("osha");
              setTab("practice");
            }}
          />
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
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await markDone("practice");
                setTab("flash");
              }}
              disabled={!practiceDone}
              className="rounded-xl bg-[#F76511] px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Practice done → Flash Cards
            </button>
          </div>
        </section>
      )}

      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <SwipeableFlashCards
            cards={getModuleFlashcards('module-1')}
            title="Flash Cards"
            autoAdvanceDelay={5}
            onComplete={async () => {
              console.log('🎯 Flashcards complete - navigating to quiz');
              await markDone("cards");
              setTab("quiz");
            }}
          />
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
            await markModuleComplete();
            setShowQuiz(false);
          }} 
        />
      )}
    </main>
  );
}
