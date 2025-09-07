"use client";
import React from 'react';
import Asset from '@/components/training/Asset';
import SvgEmbed from '@/components/training/SvgEmbed';
import { track } from '@/lib/analytics/track';

const steps = [
  { key: 'ppe_vest', label: 'Hi-vis vest', icon: 'C1_ppe' },
  { key: 'ppe_hardhat', label: 'Hard hat', icon: 'C1_ppe' },
  { key: 'ppe_boots', label: 'Safety boots', icon: 'C1_ppe' },
  { key: 'ppe_eyes_ears', label: 'Eye/Ear protection', icon: 'C1_ppe' },
  { key: 'horn_test', label: 'Horn test', icon: 'C3_controls' },
  { key: 'lights_test', label: 'Lights test', icon: 'C3_controls' },
  { key: 'data_plate', label: 'Data plate present/legible', icon: 'C5_inspection' }
] as const;

export default function PreOpModule() {
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  function toggle(k: string) {
    setDone(d => {
      const v = !d[k];
      const next = { ...d, [k]: v };
      track('preop_step_toggle', { step: k, done: v });
      return next;
    });
  }

  const allDone = steps.every(s => done[s.key]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Pre-Operation</h1>
        <p className="text-slate-600">Equip PPE and complete basic safety checks before you move the truck.</p>
      </header>

      <section className="grid sm:grid-cols-2 gap-6">
        {steps.map(s => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${done[s.key] ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'}`}
            aria-pressed={!!done[s.key]}
          >
            <Asset id={s.icon as any} alt={s.label} className="w-16 h-16" />
            <div className="flex-1">
              <div className="font-medium">{s.label}</div>
              <div className="text-sm text-slate-500">Tap to mark {done[s.key] ? 'complete' : 'complete this step'}.</div>
            </div>
            <div aria-hidden className={`w-3 h-3 rounded-full ${done[s.key] ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </button>
        ))}
      </section>

      <section className="border rounded-2xl p-4">
        <h2 className="font-medium mb-2">Seatbelt reminder</h2>
        <SvgEmbed id={'D1_seatbelt' as any} />
      </section>

      <footer className="pt-2">
        <button
          disabled={!allDone}
          onClick={() => track('preop_complete', { allDone })}
          className={`px-5 py-3 rounded-xl font-semibold ${allDone ? 'bg-black text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
        >
          {allDone ? 'Continue' : 'Complete all steps to continue'}
        </button>
      </footer>
    </main>
  );
}
