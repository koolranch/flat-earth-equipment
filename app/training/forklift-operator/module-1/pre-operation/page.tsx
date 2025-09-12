"use client";
import * as React from 'react';
import { FlashDeck } from '@/components/training/FlashDeck';
import { StatusDot } from '@/components/training/StatusDot';
import flashData from '@/content/training/forklift-operator/module-1/preop-flashcards.json';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import Module1OSHA from '@/app/training/[course]/modules/module-1/OSHA';

export default function Page(){
  // Lightweight client state for gating the Quiz tab and "Continue" button
  const [tab, setTab] = React.useState<'osha'|'practice'|'flash'|'quiz'>('osha');
  const [practiceDone, setPracticeDone] = React.useState(false);
  const [flashTouched, setFlashTouched] = React.useState(false);
  const [quizPassed, setQuizPassed] = React.useState(false);
  const [openQuiz, setOpenQuiz] = React.useState(false);

  // Persist small bits so refresh keeps state in preview sessions
  React.useEffect(() => {
    try {
      const key = 'm1-forklift-preview';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.practiceDone) setPracticeDone(true);
      if (saved.flashTouched) setFlashTouched(true);
      if (saved.quizPassed) setQuizPassed(true);
    } catch {}
  }, []);
  
  React.useEffect(() => {
    try {
      const key = 'm1-forklift-preview';
      localStorage.setItem(key, JSON.stringify({ practiceDone, flashTouched, quizPassed }));
    } catch {}
  }, [practiceDone, flashTouched, quizPassed]);

  const prereqsMet = practiceDone && flashTouched;

  async function markModuleComplete() {
    try {
      await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: 'forklift_operator',
          moduleSlug: 'module_1_preop',
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
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Module 1: Pre-Operation</h1>
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
          Flash Cards (8) <StatusDot state={flashTouched ? 'done':'todo'} />
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
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <Module1OSHA />
        </section>
      )}

      {tab==='practice' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Pre-Operation Checklist</h3>
              <p className="text-sm text-slate-600 mb-4">Complete each step to mark the practice section as done.</p>
              <div className="space-y-3">
                {[
                  { key: 'ppe', label: 'PPE on (vest, hard hat, boots, eye/ear protection)' },
                  { key: 'seatbelt', label: 'Buckle seatbelt' },
                  { key: 'parking_brake', label: 'Set parking brake' },
                  { key: 'horn_test', label: 'Test horn' },
                  { key: 'lights_test', label: 'Test lights' },
                  { key: 'data_plate', label: 'Check data plate is present/legible' }
                ].map(step => (
                  <div key={step.key} className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id={step.key}
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allSteps = ['ppe', 'seatbelt', 'parking_brake', 'horn_test', 'lights_test', 'data_plate'];
                          const checkedSteps = allSteps.filter(s => {
                            const element = document.getElementById(s) as HTMLInputElement;
                            return element?.checked || s === step.key;
                          });
                          if (checkedSteps.length === allSteps.length) {
                            setPracticeDone(true);
                          }
                        }
                      }}
                    />
                    <label htmlFor={step.key} className="text-sm">{step.label}</label>
                  </div>
                ))}
              </div>
              {practiceDone && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800">✅ Practice checklist completed!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <FlashDeck cards={(flashData as any).cards || []} />
          <div className='text-xs text-slate-500 mt-2'>Tip: open each card once before taking the quiz.</div>
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
                <h3 className='font-medium'>Module 1 Quiz</h3>
                <p className='text-sm text-slate-600'>8 questions · pass ≥ 80% to unlock next module</p>
              </div>
              <button className='px-4 py-2 rounded-md border' onClick={() => setOpenQuiz(true)}>Take quiz</button>
            </div>
          )}
        </section>
      )}

      {/* Footer CTA */}
      <div className='mt-4 flex justify-end'>
        <button
          className={`px-4 py-2 rounded-md border ${quizPassed ? 'bg-blue-600 text-white border-blue-600' : 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'}`}
          disabled={!quizPassed}
          onClick={() => {
            window.location.href = '/training/forklift-operator/module-2';
          }}
        >
          {quizPassed ? 'Continue to Module 2' : 'Complete all steps to continue'}
        </button>
      </div>

      {/* Quiz modal (uses existing quiz component) */}
      {openQuiz && (
        <SimpleQuizModal
          module={1}
          onClose={() => setOpenQuiz(false)}
          onPassed={() => { setQuizPassed(true); setOpenQuiz(false); }}
        />
      )}
    </main>
  );
}
