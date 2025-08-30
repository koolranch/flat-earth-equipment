'use client';
import { useEffect, useMemo, useState } from 'react';
import { DemoPanel } from '@/components/DemoPanel';
import LiveRegion from '@/components/a11y/LiveRegion';

const ALL = [
  { id: 'pedestrians', label: 'Pedestrians', note: 'Always yield; maintain clearance' },
  { id: 'blindcorner', label: 'Blind corner', note: 'Sound horn; slow; look' },
  { id: 'spill', label: 'Spill on floor', note: 'Stop and tag; contain spill' },
  { id: 'overhead', label: 'Overhead obstacle', note: 'Lower load; mind mast' },
  { id: 'unstable', label: 'Unstable load', note: 'Re-stack or band before moving' },
  { id: 'speed', label: 'Speed zone', note: 'Slow; keep control' },
  { id: 'ramp', label: 'Ramp/grade', note: 'Load upgrade; maintain traction' },
  { id: 'battery', label: 'Battery/charging area', note: 'PPE; proper ventilation' },
  { id: 'plate', label: 'Illegible data plate', note: 'Do not operate; service' },
  { id: 'leak', label: 'Hydraulic leak', note: 'Stop and tag; repair' },
];

function pickN<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [copy[i], copy[j]] = [copy[j], copy[i]]; 
  }
  return copy.slice(0, n);
}

export default function HazardSpotting({ locale, moduleSlug }: { locale: 'en'|'es'; moduleSlug?: string }) {
  const set = useMemo(() => pickN(ALL, 6), []);
  const [found, setFound] = useState<string[]>([]);
  const [seenTip, setSeenTip] = useState<Record<string, boolean>>({});
  const allDone = found.length === set.length;

  function pick(id: string) {
    if (found.includes(id)) return;
    setFound(prev => [...prev, id]);
    if (!seenTip[id]) setSeenTip(s => ({ ...s, [id]: true }));
  }
  
  function reset() { 
    setFound([]); 
    setSeenTip({}); 
  }

  return (
    <DemoPanel 
      title="Hazard hunt (find them all)" 
      objective="Identify common hazards and know the immediate action"
      steps={[
        'Identify common hazards', 
        'Know the immediate action'
      ]}
    >
      <LiveRegion message={allDone ? 'All hazards found' : `${found.length} of ${set.length} hazards found`} />
      
      <ul className="grid grid-cols-2 gap-2">
        {set.map(h => {
          const done = found.includes(h.id);
          return (
            <li key={h.id}>
              <button 
                onClick={() => pick(h.id)} 
                aria-pressed={done} 
                disabled={done}
                className={`w-full rounded-xl border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  done ? 'bg-emerald-50 border-emerald-400' : 'hover:bg-gray-50'
                }`}
              >
                {done ? '✓ ' : ''}{h.label}
                {seenTip[h.id] && !done && (
                  <div className="text-xs text-slate-500">{h.note}</div>
                )}
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
