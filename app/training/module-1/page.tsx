"use client";
import React from 'react';
import PPESequence from '@/components/demos/module1/PPESequence';
import ControlsIdentify from '@/components/demos/module1/ControlsIdentify';

function track(name: string, props?: Record<string, any>) {
  // safe no-op client tracker
  try { (window as any)?.analytics?.track?.(name, props); } catch {}
}

export default function Page() {
  React.useEffect(() => { track('lesson_start', { module: 1 }); }, []);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Module 1 — Pre-Operation: PPE & Controls</h1>
        <p className="text-slate-600">Suit up in the right order and locate critical controls before you roll.</p>
      </header>

      <section className="grid gap-3">
        <h2 className="text-xl font-medium">PPE Sequence</h2>
        <PPESequence onEvent={track} onComplete={() => track('demo_complete', { demo: 'module1_ppe' })} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-medium">Find the Controls</h2>
        <ControlsIdentify onEvent={track} onComplete={() => track('demo_complete', { demo: 'module1_controls' })} />
      </section>
    </main>
  );
}
