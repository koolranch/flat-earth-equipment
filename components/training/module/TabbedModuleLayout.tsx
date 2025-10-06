'use client';
import React from 'react';
import FlashCardDeck, { type FlashCard } from '@/components/training/FlashCardDeck';
import { getModuleFlashcards } from '@/lib/training/flashcards';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { useModuleTabs } from '@/hooks/useModuleTabs';
import { isStepDone } from '@/lib/trainingProgress';
import { useModuleGate } from '@/components/training/useModuleGate';
import { TabCompleteButton } from '@/components/training/TabCompleteButton';
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

  // Extract module number from title for better display
  const moduleMatch = title.match(/Module (\d+)/);
  const moduleNumber = moduleMatch ? moduleMatch[1] : '?';
  const moduleTitle = title.replace(/Module \d+:\s*/, '');
  
  // Get learning objectives based on module
  const getLearningObjectives = (moduleNum: string) => {
    switch(moduleNum) {
      case '2':
        return [
          'Complete systematic 8-point safety inspection',
          'Identify critical safety defects and hazards',
          'Understand OSHA inspection requirements'
        ];
      case '3':
        return [
          'Master load stability and weight distribution',
          'Calculate safe load capacities and limits',
          'Understand center of gravity principles'
        ];
      case '4':
        return [
          'Identify workplace hazards and risks',
          'Practice hazard recognition techniques',
          'Apply safety protocols in various scenarios'
        ];
      case '5':
        return [
          'Execute proper shutdown procedures',
          'Secure equipment safely after operation',
          'Complete end-of-shift safety protocols'
        ];
      default:
        return [
          'Master essential safety requirements',
          'Complete hands-on practice exercises',
          'Demonstrate OSHA compliance knowledge'
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className='max-w-5xl mx-auto px-4 py-8 space-y-8'>
        {/* Enhanced Header with Progress */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-canyon-rust/10 text-canyon-rust px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>📚</span> Module {moduleNumber} of 5
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{moduleTitle}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Work through OSHA basics, practice, and flash cards — then pass the quiz to continue.
          </p>
          
          {/* Learning Objectives Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-canyon-rust">🎯</span> What You'll Learn
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {getLearningObjectives(moduleNumber).map((objective, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-canyon-rust rounded-full"></span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-canyon-rust font-semibold">⏱️ Estimated Time:</span>
              <span>15-20 minutes</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-canyon-rust font-semibold">📋 Format:</span>
              <span>Interactive + Practice</span>
            </div>
          </div>
        </header>

        {/* Navigation Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              ℹ️
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to Navigate This Module</h3>
              <p className="text-sm text-blue-800 mb-3">
                Work through each tab in order. Complete OSHA Basics and Practice before accessing Flash Cards and Quiz.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded text-blue-700">1️⃣ Start with OSHA Basics</span>
                <span className="bg-white px-2 py-1 rounded text-blue-700">2️⃣ Complete Practice</span>
                <span className="bg-white px-2 py-1 rounded text-blue-700">3️⃣ Review Flash Cards</span>
                <span className="bg-white px-2 py-1 rounded text-blue-700">4️⃣ Pass Quiz (80%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Better Mobile Styling */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
          <div className='flex flex-col sm:flex-row gap-1'>
            <button 
              className={`flex-1 px-4 py-4 sm:py-3 rounded-lg font-medium text-sm sm:text-sm transition-all touch-manipulation ${
                tab==='osha'
                  ? 'bg-canyon-rust text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'
              }`} 
              onClick={() => setTab('osha')}
              data-testid="tab-osha"
            >
              <div className="flex items-center justify-center gap-2 min-h-[20px]">
                <span>📋</span>
                <span>OSHA Basics</span>
                <StatusDot state={done.osha ? 'done' : 'todo'} />
              </div>
            </button>
            <button 
              className={`flex-1 px-4 py-4 sm:py-3 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                tab==='practice'
                  ? 'bg-canyon-rust text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'
              }`} 
              onClick={() => setTab('practice')}
              data-testid="tab-practice"
            >
              <div className="flex items-center justify-center gap-2 min-h-[20px]">
                <span>🎯</span>
                <span>Practice</span>
                <StatusDot state={done.practice ? 'done' : 'todo'} />
              </div>
            </button>
            <button 
              className={`flex-1 px-4 py-4 sm:py-3 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                tab==='flash'
                  ? 'bg-canyon-rust text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'
              }`} 
              onClick={() => { setTab('flash'); if (onFlashSeen) onFlashSeen(); }}
              data-testid="tab-flash"
            >
              <div className="flex items-center justify-center gap-2 min-h-[20px]">
                <span>🗂️</span>
                <span className="hidden xs:inline">Flash Cards</span>
                <span className="xs:hidden">Cards</span>
                {flashCardCount && <span className="text-xs opacity-75">({flashCardCount})</span>}
                <StatusDot state={done.cards ? 'done' : 'todo'} />
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-4 sm:py-3 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                tab==='quiz'
                  ? 'bg-canyon-rust text-white shadow-md' 
                  : prereqsMet 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100' 
                    : 'text-slate-400 cursor-not-allowed'
              }`}
              onClick={() => prereqsMet && setTab('quiz')}
              aria-disabled={!prereqsMet}
              data-testid="tab-quiz"
            >
              <div className="flex items-center justify-center gap-2 min-h-[20px]">
                <span>{prereqsMet ? '✅' : '🔒'}</span>
                <span>Quiz</span>
                <span className="text-xs opacity-75">({quizMeta.questions})</span>
                <StatusDot state={quizPassed ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
              </div>
            </button>
          </div>
        </div>

      {tab==='osha' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {osha}
          <div className="mt-4 flex justify-end">
            <TabCompleteButton
              label="Mark OSHA Basics done → Practice"
              aria-label="Mark OSHA Basics complete and go to Practice"
              onClick={async () => {
                await markDone("osha");
                setTab("practice");
              }}
            />
          </div>
        </section>
      )}
      {tab==='practice' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {practice({ onComplete: () => setPracticeDone(true) })}
          <div className="mt-4 flex justify-end">
            <TabCompleteButton
              label="Mark Practice done → Flash Cards"
              aria-label="Mark Practice complete and go to Flash Cards"
              onClick={async () => {
                await markDone("practice");
                setTab("flash");
              }}
            />
          </div>
        </section>
      )}
      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-4 mb-4 shadow-card'>
          {(() => {
            if (!moduleCards.length) return <div className='text-sm text-slate-600'>No flash cards found for this module yet.</div>;
            if (typeof window !== 'undefined') {
              try { localStorage.setItem(`flashcards:seen:${courseSlug ?? 'forklift'}:${flashModuleKey ?? '-'}`, '1'); } catch {}
              if (onFlashSeen) onFlashSeen();
            }
            
            return (
              <FlashCardDeck
                cards={moduleCards}
                title="Flash Cards"
                onDone={async () => {
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
                <h3 className='font-semibold text-lg'>Module Quiz</h3>
                <p className='text-sm text-slate-600'>{quizMeta.questions} questions · pass ≥ {quizMeta.passPct}% to unlock next module</p>
              </div>
              <button 
                className='px-6 py-3 rounded-xl font-semibold bg-[#F76511] text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all' 
                onClick={() => setOpenQuiz(true)}
              >
                Take Quiz →
              </button>
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
    </div>
  );
}
