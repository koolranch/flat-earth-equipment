'use client';
import { useState } from 'react';
import { DemoPanel } from '@/components/DemoPanel';
import LiveRegion from '@/components/a11y/LiveRegion';

const STEPS = [
  { id: 'vest', label: 'Hi-vis vest' },
  { id: 'hardhat', label: 'Hard hat' },
  { id: 'brake', label: 'Set parking brake' },
  { id: 'forks', label: 'Lower forks' },
];

export default function PPESequence({ locale, moduleSlug }: { locale: 'en'|'es'; moduleSlug?: string }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const nextId = STEPS[placed.length]?.id;
  const done = placed.length === STEPS.length;

  function place(id: string) { 
    if (id === nextId) setPlaced(p => [...p, id]); 
  }
  
  function reset() { 
    setPlaced([]); 
  }

  return (
    <DemoPanel 
      title="PPE & Safe State (strict order)" 
      objective="Equip PPE and safe state in order to understand pre-op readiness"
      steps={[
        'Equip PPE and safe state in order',
        'Understand pre-op readiness',
      ]}
    >
      <LiveRegion text={done ? 'Sequence complete' : `${placed.length} of ${STEPS.length} placed`} />
      
      <div className="grid grid-cols-2 gap-2">
        {STEPS.map(s => {
          const isDone = placed.includes(s.id);
          const isNext = s.id === nextId;
          return (
            <button 
              key={s.id} 
              onClick={() => place(s.id)} 
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
        {done ? (
          <span className="text-emerald-700">All set.</span>
        ) : (
          <>Next: <strong>{STEPS.find(x => x.id === nextId)?.label}</strong></>
        )}
      </div>
      
      <div className="mt-2">
        <button onClick={reset} className="rounded-xl border px-3 py-2 text-sm">Reset</button>
      </div>
    </DemoPanel>
  );
}
