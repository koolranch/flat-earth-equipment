'use client';
import React from 'react';
import StabilityPlayground from '@/components/demos/module3/StabilityPlayground';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SafeLoader from '@/components/common/SafeLoader';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { track } from '@/lib/track';

export default function Page() {
  const [touched, setTouched] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);
  React.useEffect(() => { track('lesson_start', { module: 3 }); }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 3 — Balance & Load Handling</h1>
        <p className="text-slate-600">Explore load + tilt effects on stability.</p>
      </header>
      <ErrorBoundary>
        <SafeLoader label="Loading stability sim…">
          <StabilityPlayground onEvent={(n,p) => { track(n,p); if (!touched) setTouched(true); }} onComplete={() => { setTouched(true); track('lesson_demo_complete', { module: 3, demo: 'stability' }); }} />
        </SafeLoader>
      </ErrorBoundary>
      <section className="flex items-center gap-3">
        <button className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50" disabled={!touched} onClick={() => setShowQuiz(true)}>Start Quiz</button>
        {!touched && <span className="text-sm text-slate-500">Interact with the sim to unlock the quiz.</span>}
      </section>
      {showQuiz && (
        <SimpleQuizModal module={3} onClose={() => setShowQuiz(false)} onPassed={async (score) => {
          track('lesson_complete', { module: 3, score });
          try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 3, kind: 'lesson_complete', score }) }); } catch {}
        }} />
      )} 
    </main>
  );
}
