"use client";
import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/content/assets/manifest';
import { track } from '@/lib/analytics';

type Step = {
  id: string;
  titleKey: string;
  spriteHint?: { x: number; y: number; w: number; h: number }; // reserved if we later sprite-slice
  assetId?: keyof typeof ASSETS; // animated feedback image
};

const ORDER: Step[] = [
  { id: 'neutral',       titleKey: 'module5.steps.neutral' },
  { id: 'steer_straight',titleKey: 'module5.steps.steer' },
  { id: 'brake',         titleKey: 'module5.steps.brake', assetId: 'D2_brake' },
  { id: 'forks_down',    titleKey: 'module5.steps.forks', assetId: 'D3_forks' },
  { id: 'key_off',       titleKey: 'module5.steps.keyoff' },
  { id: 'connect_charge',titleKey: 'module5.steps.charge', assetId: 'D4_charge' },
  { id: 'wheel_chock',   titleKey: 'module5.steps.chock' }
];

export default function ShutdownTrainer() {
  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState<string[]>([]);
  const [mistakes, setMistakes] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { track('demo_start', { module: 5, demo: 'shutdown_trainer' }); }, []);

  const expectId = ORDER[idx]?.id;
  const onPick = (id: string) => {
    if (done) return;
    if (id === expectId) {
      setPicked(p => [...p, id]);
      const next = idx + 1;
      if (next >= ORDER.length) {
        setDone(true);
        track('demo_complete', { module: 5, mistakes });
      } else {
        setIdx(next);
      }
    } else {
      setMistakes(m => m + 1);
      track('sim_param_change', { module: 5, type: 'wrong_step', id, expected: expectId });
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Module 5 — Shutdown Trainer</h1>
        <p className="text-slate-600">Tap the steps in the correct order. Minimal text, maximal clarity.</p>
      </div>

      <ol className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {ORDER.map((s, i) => {
          const state = picked.includes(s.id) ? 'done' : i === idx ? 'active' : 'idle';
          return (
            <li key={s.id}>
              <button
                onClick={() => onPick(s.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${state==='done' ? 'border-emerald-500 bg-emerald-50' : state==='active' ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">Step {i+1}</div>
                <div className="text-lg font-semibold">{s.titleKey}</div>
                {s.assetId && (
                  <div className="relative mt-3 w-full" style={{ aspectRatio: '3 / 1' }}>
                    <Image src={ASSETS[s.assetId].src} alt={ASSETS[s.assetId].alt} fill className="object-contain" />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border p-4">
        {!done ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">Expected next:</div>
              <div className="text-base font-semibold">{ORDER[idx].titleKey}</div>
            </div>
            <div className="text-sm text-slate-600">Mistakes: {mistakes}</div>
          </div>
        ) : (
          <div className="rounded-md bg-emerald-50 p-4 text-emerald-900">
            <div className="font-semibold">Shutdown complete.</div>
            <div className="text-sm">You followed the 7-step sequence. Continue to quiz or next lesson.</div>
          </div>
        )}
      </div>
    </div>
  );
}
