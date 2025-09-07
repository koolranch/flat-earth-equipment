import React from 'react';
import InspectionEight from '@/components/demos/module2/InspectionEight';

function track(name: string, props?: Record<string, any>) { try { (window as any)?.analytics?.track?.(name, props); } catch {} }

export default function Page() {
  React.useEffect(() => { track('lesson_start', { module: 2 }); }, []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 2 — Daily Inspection (8-Point)</h1>
        <p className="text-slate-600">Tap each item to complete the daily safety check.</p>
      </header>
      <section className="grid gap-3">
        <InspectionEight onEvent={track} onComplete={() => track('demo_complete', { demo: 'module2_8point' })} />
      </section>
    </main>
  );
}
