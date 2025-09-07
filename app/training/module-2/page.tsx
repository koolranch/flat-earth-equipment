'use client';
import React from 'react';
import InspectionEight from '@/components/demos/module2/InspectionEight';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { track } from '@/lib/track';

export default function Page() {
  const [done, setDone] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);
  React.useEffect(() => { track('lesson_start', { module: 2 }); }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 2 — Daily Inspection (8-Point)</h1>
        <p className="text-slate-600">Tap each item to complete the daily safety check.</p>
      </header>
      <section className="grid gap-3">
        <InspectionEight onEvent={track} onComplete={() => { setDone(true); track('lesson_demo_complete', { module: 2, demo: 'inspection_8' }); }} />
      </section>
      <section className="flex items-center gap-3">
        <button className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50" disabled={!done} onClick={() => setShowQuiz(true)}>Start Quiz</button>
        {!done && <span className="text-sm text-slate-500">Complete the inspection to unlock the quiz.</span>}
      </section>
      {showQuiz && <SimpleQuizModal module={2} onClose={() => setShowQuiz(false)} onPassed={async (score) => {
        track('lesson_complete', { module: 2, score });
        try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 2, kind: 'lesson_complete', score }) }); } catch {}
      }}/>} 
    </main>
  );
}
