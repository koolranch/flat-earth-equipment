'use client';
import React from 'react';
import PPESequence from '@/components/demos/module1/PPESequence';
import ControlsIdentify from '@/components/demos/module1/ControlsIdentify';
import { track } from '@/lib/track';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';

export default function Page() {
  const [ppeDone, setPpeDone] = React.useState(false);
  const [controlsDone, setControlsDone] = React.useState(false);
  const [showQuiz, setShowQuiz] = React.useState(false);

  React.useEffect(() => { track('lesson_start', { module: 1 }); }, []);
  const allDone = ppeDone && controlsDone;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 1 — Pre-Operation: PPE & Controls</h1>
        <p className="text-slate-600">Suit up in the right order and locate critical controls before you roll.</p>
      </header>

      <section className="grid gap-3">
        <h2 className="text-xl font-medium">PPE Sequence</h2>
        <PPESequence onEvent={track} onComplete={() => { setPpeDone(true); track('lesson_demo_complete', { module: 1, demo: 'ppe' }); }} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-medium">Find the Controls</h2>
        <ControlsIdentify onEvent={track} onComplete={() => { setControlsDone(true); track('lesson_demo_complete', { module: 1, demo: 'controls' }); }} />
      </section>

      <section className="flex items-center gap-3">
        <button className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50" disabled={!allDone} onClick={() => setShowQuiz(true)}>Start Quiz</button>
        {!allDone && <span className="text-sm text-slate-500">Complete both activities to unlock the quiz.</span>}
      </section>

      {showQuiz && <SimpleQuizModal module={1} onClose={() => setShowQuiz(false)} onPassed={async (score) => {
        track('lesson_complete', { module: 1, score });
        try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module: 1, kind: 'lesson_complete', score }) }); } catch {}
      }}/>}    
    </main>
  );
}
