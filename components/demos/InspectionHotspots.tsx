'use client';
import { useState } from 'react';
import { DemoPanel } from '@/components/DemoPanel';
import LiveRegion from '@/components/a11y/LiveRegion';

const TARGETS = [
  { id: 'tires', label: 'Tires', tip: 'No major cuts; proper inflation' },
  { id: 'forks', label: 'Forks', tip: 'No cracks; heels not worn' },
  { id: 'chains', label: 'Lift chains', tip: 'No kinks; proper tension' },
  { id: 'hydraulic', label: 'Hydraulic lines', tip: 'No leaks/wetness' },
  { id: 'controls', label: 'Controls', tip: 'Operate smoothly' },
  { id: 'battery', label: 'Battery/LP', tip: 'Secured + connections tight' },
  { id: 'horn', label: 'Horn/Lights', tip: 'Horn loud; lights function' },
  { id: 'seatbelt', label: 'Seat belt', tip: 'Latch works; use it' },
];

export default function InspectionHotspots({ locale, moduleSlug }: { locale: 'en'|'es'; moduleSlug?: string }) {
  const [found, setFound] = useState<string[]>([]);
  const allDone = found.length === TARGETS.length;
  
  function pick(id: string) { 
    setFound(prev => prev.includes(id) ? prev : [...prev, id]); 
  }
  
  function reset() { 
    setFound([]); 
  }

  return (
    <DemoPanel 
      title="8-Point Daily Inspection" 
      objective="Tap each point as you inspect and log defects before operating"
      steps={[
        'Tap each point as you inspect',
        'Log defects before operating'
      ]}
    >
      <LiveRegion message={allDone ? 'All points inspected' : `${found.length} of ${TARGETS.length} inspected`} />
      
      <ul className="grid grid-cols-2 gap-2">
        {TARGETS.map(t => {
          const done = found.includes(t.id);
          return (
            <li key={t.id}>
              <button 
                onClick={() => pick(t.id)} 
                aria-pressed={done} 
                disabled={done}
                className={`w-full rounded-xl border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  done ? 'bg-emerald-50 border-emerald-400' : 'hover:bg-gray-50'
                }`}
              >
                {done ? '✓ ' : ''}{t.label}
                <div className="text-xs text-slate-500">{t.tip}</div>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-2">
        <button onClick={reset} className="rounded-xl border px-3 py-2 text-sm">Reset</button>
      </div>
    </DemoPanel>
  );
}
