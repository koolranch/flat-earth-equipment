'use client';
import React from 'react';
import PPESequence from '@/components/demos/module1/PPESequence';
import ControlsHotspots from '@/components/demos/module1/ControlsHotspots';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SafeLoader from '@/components/common/SafeLoader';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { track } from '@/lib/track';

export default function Page() {
  const [ppeDone, setPpeDone] = React.useState(false);
  const [ctrlDone, setCtrlDone] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);
  React.useEffect(() => { track('lesson_start', { module: 1 }); }, []);

  const unlock = ppeDone && ctrlDone;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 1 — Pre-Operation</h1>
        <p className="text-slate-600">PPE sequence & identify key controls.</p>
      </header>
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
      <section className="flex items-center gap-3">
        <button className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50" disabled={!unlock} onClick={() => setShowQuiz(true)}>Start Quiz</button>
        {!unlock && <span className="text-sm text-slate-500">Complete both demos to unlock the quiz.</span>}
      </section>
      {showQuiz && (
        <SimpleQuizModal module={1} onClose={() => setShowQuiz(false)} onPassed={async (score) => {
          track('lesson_complete', { module: 1, score });
          try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 1, kind: 'lesson_complete', score }) }); } catch {}
        }} />
      )}
    </main>
  );
}
