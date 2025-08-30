'use client';
import { useMemo, useState } from 'react';
import { DemoPanel } from '@/components/DemoPanel';
import LiveRegion from '@/components/a11y/LiveRegion';
import { useDemoAnalytics } from '@/lib/analytics/useDemoAnalytics';

type Fuel = 'electric' | 'lpg';

const BASE = [
  { id: 'neutral', label: 'Shift to neutral' },
  { id: 'steer', label: 'Wheel straight' },
  { id: 'brake', label: 'Set parking brake' },
  { id: 'forks', label: 'Lower forks to floor' },
  { id: 'key', label: 'Key off' },
];
const ELECTRIC = [
  { id: 'plug', label: 'Plug in charger' },
  { id: 'chock', label: 'Wheel chock if required' },
];
const LPG = [
  { id: 'close_valve', label: 'Close LPG tank valve' },
  { id: 'chock', label: 'Wheel chock if required' },
];

export default function MiniShutdown({ locale, moduleSlug }: { locale: 'en'|'es'; moduleSlug?: string }) {
  const [fuel, setFuel] = useState<Fuel>('electric');
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const { fire } = useDemoAnalytics('MiniShutdown', moduleSlug);

  const steps = useMemo(() => BASE.concat(fuel === 'electric' ? ELECTRIC : LPG), [fuel]);
  const nextId = steps[doneIds.length]?.id;
  const complete = doneIds.length === steps.length;

  function toggleFuel(next: Fuel) {
    if (next === fuel) return;
    setFuel(next);
    setDoneIds([]); // reset on branch change
    fire('sim_param_change', { param: 'fuel', value: next });
  }
  
  function takeStep(id: string) { 
    if (id === nextId) setDoneIds(prev => [...prev, id]); 
  }
  
  function reset() { 
    setDoneIds([]); 
  }

  return (
    <DemoPanel 
      title="Shutdown sequence (strict order)" 
      objective="Park and secure in sequence and apply branch actions for fuel type"
      steps={[
        'Park and secure in sequence',
        'Apply branch actions for fuel type'
      ]}
    >
      <LiveRegion message={complete ? 'Shutdown complete' : `${doneIds.length} of ${steps.length} steps`} />

      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => toggleFuel('electric')} 
          aria-pressed={fuel === 'electric'} 
          className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            fuel === 'electric' ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        >
          Electric
        </button>
        <button 
          onClick={() => toggleFuel('lpg')} 
          aria-pressed={fuel === 'lpg'} 
          className={`rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            fuel === 'lpg' ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        >
          LPG
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {steps.map(s => {
          const isDone = doneIds.includes(s.id);
          const isNext = s.id === nextId;
          return (
            <button 
              key={s.id} 
              onClick={() => takeStep(s.id)} 
              disabled={isDone} 
              aria-pressed={isDone}
              className={`rounded-xl border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDone ? 'bg-emerald-50 border-emerald-400' : isNext ? 'border-slate-900' : ''
              }`}
            >
              {isDone ? '✓ ' : ''}{s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-sm">
        {complete ? (
          <span className="text-emerald-700">All set.</span>
        ) : (
          <>Next: <strong>{steps.find(x => x.id === nextId)?.label}</strong></>
        )}
      </div>

      <div className="mt-2">
        <button onClick={reset} className="rounded-xl border px-3 py-2 text-sm">Reset</button>
      </div>
    </DemoPanel>
  );
}
