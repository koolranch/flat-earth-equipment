'use client';
import React from 'react';
import { FlashDeck } from '@/components/training/FlashDeck';
import { normalizeFlashCards } from '@/lib/training/normalizeFlashCards';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';

type Props = {
  courseSlug: string;
  moduleSlug: string;
  title: string;
  nextHref: string;
  flashCards: any[];
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
  courseSlug, moduleSlug, title, nextHref, flashCards, osha, practice,
  quizMeta = { questions: 8, passPct: 80 }
}: Props) {
  const [tab, setTab] = React.useState<'osha'|'practice'|'flash'|'quiz'>('osha');
  const [practiceDone, setPracticeDone] = React.useState(false);
  const [flashTouched, setFlashTouched] = React.useState(false);
  const [quizPassed, setQuizPassed] = React.useState(false);
  const [openQuiz, setOpenQuiz] = React.useState(false);

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

  const prereqsMet = practiceDone && flashTouched;

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
      <h2 className='text-xl font-semibold'>{title}</h2>
      <p className='text-sm text-slate-600 mb-4'>Work through OSHA basics, practice, and flash cards — then pass the quiz to continue.</p>

      <div className='flex gap-2 mb-4'>
        <button className={`px-3 py-1.5 rounded-md border ${tab==='osha'?'bg-white':'bg-slate-50'}`} onClick={() => setTab('osha')}>
          OSHA Basics <StatusDot state={(practiceDone||flashTouched||quizPassed)?'done':'todo'} />
        </button>
        <button className={`px-3 py-1.5 rounded-md border ${tab==='practice'?'bg-white':'bg-slate-50'}`} onClick={() => setTab('practice')}>
          Practice <StatusDot state={practiceDone?'done':'todo'} />
        </button>
        <button className={`px-3 py-1.5 rounded-md border ${tab==='flash'?'bg-white':'bg-slate-50'}`} onClick={() => { setTab('flash'); setFlashTouched(true); }}>
          Flash Cards <StatusDot state={flashTouched?'done':'todo'} />
        </button>
        <button
          className={`px-3 py-1.5 rounded-md border ${tab==='quiz'?'bg-white':'bg-slate-50'} ${!prereqsMet && 'opacity-50 cursor-not-allowed'}`}
          onClick={() => prereqsMet && setTab('quiz')}
          aria-disabled={!prereqsMet}
        >
          Quiz <StatusDot state={quizPassed ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
        </button>
      </div>

      {tab==='osha' && (<section className='rounded-2xl border bg-white p-4 mb-4'>{osha}</section>)}
      {tab==='practice' && (<section className='rounded-2xl border bg-white p-4 mb-4'>{practice({ onComplete: () => setPracticeDone(true) })}</section>)}
      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          {(() => {
            const normalized = normalizeFlashCards(flashCards as any);
            if (normalized.length === 0) {
              if (typeof window !== 'undefined') {
                // Helpful debug so you can see what's arriving
                // @ts-ignore
                console.warn('[FlashCards] No cards found for', { flashCards });
              }
              return (
                <div className='text-sm text-slate-600'>
                  No flash cards found for this module yet.
                </div>
              );
            }
            return <FlashDeck cards={normalized as any} />;
          })()}
          <div className='text-xs text-slate-500 mt-2'>Tip: open each card before taking the quiz.</div>
        </section>
      )}
      {tab==='quiz' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          {!prereqsMet ? (
            <div className='text-sm text-slate-600'>
              <p className='mb-2 flex items-center gap-2'><span>🔒</span> The quiz unlocks after:</p>
              <ul className='list-disc ml-6 space-y-1'>
                <li>Complete the Practice checklist</li>
                <li>Open the Flash Cards</li>
              </ul>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Module Quiz</h3>
                <p className='text-sm text-slate-600'>{quizMeta.questions} questions · pass ≥ {quizMeta.passPct}%</p>
              </div>
              <button className='px-4 py-2 rounded-md border' onClick={() => setOpenQuiz(true)}>Take quiz</button>
            </div>
          )}
        </section>
      )}

      <div className='mt-4 flex justify-end'>
        <button
          className={`px-4 py-2 rounded-md border ${quizPassed ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!quizPassed}
          onClick={() => { window.location.href = nextHref; }}
        >
          {quizPassed ? 'Continue' : 'Complete all steps to continue'}
        </button>
      </div>

      {openQuiz && (
        <SimpleQuizModal
          module={parseInt(moduleSlug.match(/\d+/)?.[0] || '1')}
          onClose={() => setOpenQuiz(false)}
          onPassed={() => { setOpenQuiz(false); setQuizPassed(true); }}
        />
      )}
    </div>
  );
}
