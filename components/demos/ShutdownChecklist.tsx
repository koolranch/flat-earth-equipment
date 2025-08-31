'use client';
import { useState } from 'react';

const STEPS = [
  'Neutral gear',
  'Steer wheels straight',
  'Full brake',
  'Lower forks to floor',
  'Key off',
  'Plug charger (electric) / fuel off (ICE)',
  'Wheel chock if on grade'
];

export default function ShutdownChecklist() {
  const [idx, setIdx] = useState(0);

  function doStep(i: number) {
    if (i !== idx) {
      window.dispatchEvent(new CustomEvent('demo:child', { detail: { type: 'sim_param_change', step: i, ok: false } }));
      return;
    }
    window.dispatchEvent(new CustomEvent('demo:child', { detail: { type: 'sim_param_change', step: i, ok: true } }));
    const next = i + 1;
    setIdx(next);
    if (next >= STEPS.length) {
      window.dispatchEvent(new CustomEvent('demo:child', { detail: { type: 'demo_complete' } }));
    }
  }

  return (
    <ol className="space-y-2" aria-label="Shutdown steps">
      {STEPS.map((label, i) => {
        const state = i < idx ? 'done' : (i === idx ? 'current' : 'pending');
        return (
          <li key={i} className={`rounded-xl border p-3 ${state === 'done' ? 'bg-emerald-50 border-emerald-400' : state === 'current' ? 'bg-slate-50 border-slate-400' : 'bg-white'}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{i + 1}. {label}</div>
                {state === 'current' && <div className="text-xs text-slate-500">Do this now</div>}
              </div>
              <button
                onClick={() => doStep(i)}
                className={`rounded-xl border px-3 py-1 text-sm ${state === 'done' ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-disabled={state === 'done'}
                aria-current={state === 'current' ? 'step' : undefined}
              >{state === 'done' ? 'Done' : 'Mark done'}</button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
