"use client";
import React from 'react';
import StabilityPlayground from '@/components/demos/module3/StabilityPlayground';

function track(name: string, props?: Record<string, any>) { try { (window as any)?.analytics?.track?.(name, props); } catch {} }

export default function Page() {
  React.useEffect(() => { track('lesson_start', { module: 3 }); }, []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 3 — Balance & Load Handling</h1>
        <p className="text-slate-600">Explore load + tilt and see when you exit the stability triangle.</p>
      </header>
      <section className="grid gap-3">
        <StabilityPlayground onEvent={track} onComplete={() => track('demo_complete', { demo: 'module3_stability' })} />
      </section>
    </main>
  );
}
