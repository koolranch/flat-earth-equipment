'use client';
import React from 'react';
import Image from 'next/image';
import { track } from '@/lib/analytics/track';
import { assetUrl } from '@/lib/assets';
import { resolveAsset } from '@/lib/asset-manifest';

const steps = [
  { key: 'ppe_vest', label: 'Hi-vis vest', iconKey: 'ppeVest' },
  { key: 'ppe_hardhat', label: 'Hard hat', iconKey: 'ppeHardhat' },
  { key: 'ppe_boots', label: 'Safety boots', iconKey: 'ppeBoots' },
  { key: 'ppe_eyes_ears', label: 'Eye/Ear protection', iconKey: 'ppeGoggles' },
  { key: 'horn_test', label: 'Horn test', iconKey: 'controlHorn' },
  { key: 'lights_test', label: 'Lights test', iconKey: 'controlLights' },
  { key: 'data_plate', label: 'Data plate present/legible', iconKey: 'dataPlate' }
] as const;

export function Module1Practice({ onComplete }: { onComplete: () => void }) {
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  // Load saved state
  React.useEffect(() => {
    try {
      const key = 'm1-practice-state';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.done) setDone(saved.done);
    } catch {}
  }, []);

  // Save state and check completion
  React.useEffect(() => {
    try {
      const key = 'm1-practice-state';
      localStorage.setItem(key, JSON.stringify({ done }));
      
      // Check if all steps are completed
      const allDone = steps.every(s => done[s.key]);
      if (allDone) {
        onComplete();
      }
    } catch {}
  }, [done, onComplete]);

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
    <div className="space-y-8">
      <section className="grid sm:grid-cols-2 gap-6">
        {steps.map(s => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
              done[s.key] 
                ? 'border-emerald-500 ring-1 ring-emerald-200' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            aria-pressed={!!done[s.key]}
          >
            <Image 
              src={assetUrl(resolveAsset(s.iconKey))} 
              alt={s.label} 
              width={48} 
              height={48} 
              className="w-12 h-12 rounded-md" 
            />
            <div className="flex-1">
              <div className="font-medium">{s.label}</div>
              <div className="text-sm text-slate-500">
                Tap to mark {done[s.key] ? 'complete' : 'complete this step'}.
              </div>
            </div>
            <div 
              aria-hidden 
              className={`w-3 h-3 rounded-full ${
                done[s.key] ? 'bg-emerald-500' : 'bg-slate-300'
              }`} 
            />
          </button>
        ))}
      </section>

      <section className="border rounded-2xl p-4">
        <h2 className="font-medium mb-2">Seatbelt reminder</h2>
        <div className="flex justify-center">
          <img 
            src="/training/d1-seatbelt.svg" 
            alt="Seatbelt latch animation" 
            className="w-full max-w-lg"
          />
        </div>
        <p className="text-sm text-slate-600 mt-2 text-center">
          Always buckle your seatbelt before moving the forklift
        </p>
      </section>

      {allDone && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">✅ Practice section completed!</p>
        </div>
      )}
    </div>
  );
}
