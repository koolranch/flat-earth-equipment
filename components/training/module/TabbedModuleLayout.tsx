'use client';
import React from 'react';
import FlashCardDeck, { type FlashCard } from '@/components/training/FlashCardDeck';
import { getModuleFlashcards } from '@/lib/training/flashcards';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { useModuleTabs } from '@/hooks/useModuleTabs';
import { isStepDone } from '@/lib/trainingProgress';
import { useModuleGate } from '@/components/training/useModuleGate';
import { TabCompleteButton } from '@/components/training/TabCompleteButton';
import StepContinue from '@/components/training/module/StepContinue';
import { ModuleFooterCTA } from '@/components/training/ModuleFooterCTA';

type Props = {
  courseSlug: string;
  moduleSlug: string;
  moduleKey?: 'm1'|'m2'|'m3'|'m4'|'m5'; // NEW: for progress tracking
  title: string;
  nextHref: string;
  flashCards?: any[];
  flashModuleKey?: string; // NEW: runtime fetch key like 'module-2'
  flashCardCount?: number; // NEW: show count in tab label
  onFlashSeen?: () => void;
  osha: React.ReactNode;
  practice: (opts: { onComplete: () => void }) => React.ReactNode;
  quizMeta?: { questions: number; passPct: number };
};

function StatusDot({ state }: { state: 'locked' | 'todo' | 'done' }) {
  if (state === 'locked') return <span className='ml-2 inline-flex items-center text-slate-400' aria-label='locked'>🔒</span>;
  if (state === 'done')   return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-emerald-500' aria-label='complete' />;
  return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-slate-300' aria-label='incomplete' />;
}

export default function TabbedModuleLayout({
  courseSlug, moduleSlug, moduleKey, title, nextHref, flashCards, flashModuleKey, flashCardCount, onFlashSeen, osha, practice,
  quizMeta = { questions: 8, passPct: 80 }
}: Props) {
  // Use URL-based tab state
  const { activeTab, setActiveTab } = useModuleTabs('osha');
  const tab = activeTab;
  const setTab = setActiveTab;

  // Use new progress tracking system
  const { done, markDone, allDone } = useModuleGate({
    courseId: courseSlug,
    moduleKey: moduleKey || 'unknown',
    initial: { osha: false, practice: false, cards: false, quiz: false }
  });

  const [openQuiz, setOpenQuiz] = React.useState(false);

  // Get curated flashcards for this module
  const moduleCards = React.useMemo(() => {
    const moduleSlugForCards = moduleKey ? `module-${moduleKey.replace('m', '')}` : 'module-1';
    return getModuleFlashcards(moduleSlugForCards);
  }, [moduleKey]);

  // Legacy state for backward compatibility
  const [practiceDone, setPracticeDone] = React.useState(false);
  const [flashTouched, setFlashTouched] = React.useState(false);
  const [quizPassed, setQuizPassed] = React.useState(false);

  const key = `mstate:${courseSlug}:${moduleSlug}`;
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.practiceDone) setPracticeDone(true);
      if (saved.flashTouched) setFlashTouched(true);
      if (saved.quizPassed) setQuizPassed(true);
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ practiceDone, flashTouched, quizPassed }));
    } catch {}
  }, [practiceDone, flashTouched, quizPassed]);

  const prereqsMet = done.osha && done.practice && done.cards;

  async function markModuleComplete() {
    try {
      await fetch('/api/progress/complete-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseSlug, module: moduleSlug })
      });
    } catch {}
  }
  React.useEffect(() => {
    if (quizPassed) markModuleComplete();
  }, [quizPassed]);

  return (
    <div className='max-w-5xl mx-auto'>
      <h2 className='h2'>{title}</h2>
      <p className='text-sm text-slate-600 mb-4'>Work through OSHA basics, practice, and flash cards — then pass the quiz to continue.</p>

      <div className='flex gap-2 mb-4'>
        <button 
          className={`px-3 py-1.5 rounded-xl border transition-colors ${tab==='osha'?'bg-gray-100 border-gray-300 text-ink':'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`} 
          onClick={() => setTab('osha')}
          data-testid="tab-osha"
        >
          OSHA Basics <StatusDot state={done.osha ? 'done' : 'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-xl border transition-colors ${tab==='practice'?'bg-gray-100 border-gray-300 text-ink':'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`} 
          onClick={() => setTab('practice')}
          data-testid="tab-practice"
        >
          Practice <StatusDot state={done.practice ? 'done' : 'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-xl border transition-colors ${tab==='flash'?'bg-gray-100 border-gray-300 text-ink':'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`} 
          onClick={() => { setTab('flash'); if (onFlashSeen) onFlashSeen(); }}
          data-testid="tab-flash"
        >
          Flash Cards{flashCardCount ? ` (${flashCardCount})` : ''} <StatusDot state={done.cards ? 'done' : 'todo'} />
        </button>
        <button
          className={`px-3 py-1.5 rounded-xl border transition-colors ${tab==='quiz'?'bg-gray-100 border-gray-300 text-ink':'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'} ${!prereqsMet && 'opacity-50 cursor-not-allowed'}`}
          onClick={() => prereqsMet && setTab('quiz')}
          aria-disabled={!prereqsMet}
          data-testid="tab-quiz"
        >
          Quiz ({quizMeta.questions}) <StatusDot state={quizPassed ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
        </button>
      </div>

      {tab==='osha' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {osha}
          <StepContinue
            step="osha"
            nextTab="practice"
            markDone={markDone}
            onSwitchTab={setTab}
            alreadyDone={done.osha}
          />
        </section>
      )}
      {tab==='practice' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {practice({ onComplete: () => setPracticeDone(true) })}
          <StepContinue
            step="practice"
            nextTab="flash"
            markDone={markDone}
            onSwitchTab={setTab}
            alreadyDone={done.practice}
          />
        </section>
      )}
      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {(() => {
            if (!moduleCards.length) return <div className='text-sm text-slate-600'>No flash cards found for this module yet.</div>;
            // DB is source of truth for flashcard completion
            if (onFlashSeen) onFlashSeen();
            
            return (
              <FlashCardDeck
                cards={moduleCards}
                title="Flash Cards"
                onDone={async () => {
                  // DB-only persistence; localStorage removed to avoid drift
                  await markDone("cards");
                  setTab("quiz");
                }}
              />
            );
          })()}
        </section>
      )}
      {tab==='quiz' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {!prereqsMet ? (
            <div className='text-sm text-slate-600'>
              <p className='mb-2 flex items-center gap-2'><span>🔒</span> The quiz unlocks after:</p>
              <ul className='list-disc ml-6 space-y-1'>
                <li>Complete the OSHA Basics</li>
                <li>Complete the Practice checklist</li>
                <li>Open the Flash Cards</li>
              </ul>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Module Quiz</h3>
                <p className='text-sm text-slate-600'>{quizMeta.questions} questions · pass ≥ {quizMeta.passPct}% to unlock next module</p>
              </div>
              <button className='px-4 py-2 rounded-md border' onClick={() => setOpenQuiz(true)} data-testid="take-quiz">Take quiz</button>
            </div>
          )}
        </section>
      )}

      <ModuleFooterCTA
        nextHref={allDone ? nextHref : ""}
        enabled={allDone}
        isLast={nextHref.includes('exam') || nextHref.includes('final')}
      />

      {openQuiz && (
        <SimpleQuizModal
          module={parseInt(moduleSlug.match(/\d+/)?.[0] || '1')}
          onClose={() => setOpenQuiz(false)}
          onPassed={async () => { 
            setOpenQuiz(false); 
            setQuizPassed(true); 
            await markDone("quiz");
          }}
        />
      )}
    </div>
  );
}
