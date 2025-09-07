import React from 'react';

interface Props { onComplete?: () => void; onEvent?: (name: string, props?: Record<string, any>) => void }

const points = [
  { id: 'tires', label: 'Tires' },
  { id: 'forks', label: 'Forks' },
  { id: 'chains', label: 'Chains' },
  { id: 'horn', label: 'Horn' },
  { id: 'lights', label: 'Lights' },
  { id: 'hydraulics', label: 'Hydraulics' },
  { id: 'leaks', label: 'Leaks' },
  { id: 'dataplate', label: 'Data plate' }
];

const iconHref = (id: string) => ({
  tires: '/training/icons/inspection-sprite.svg#inspect-tires',
  forks: '/training/icons/inspection-sprite.svg#inspect-forks',
  chains: '/training/icons/inspection-sprite.svg#inspect-chains',
  horn: '/training/icons/inspection-sprite.svg#inspect-horn',
  lights: '/training/icons/inspection-sprite.svg#inspect-lights',
  hydraulics: '/training/icons/inspection-sprite.svg#inspect-hydraulics',
  leaks: '/training/icons/inspection-sprite.svg#inspect-leaks',
  dataplate: '/training/icons/inspection-sprite.svg#inspect-data-plate'
} as any)[id];

export default function InspectionEight({ onComplete, onEvent }: Props) {
  const [checked, setChecked] = React.useState<string[]>([]);
  const done = checked.length === points.length;

  const toggle = (id: string) => {
    if (checked.includes(id)) return; // enforce once
    const next = [...checked, id];
    setChecked(next);
    onEvent?.('sim_param_change', { sim: 'module2_8point', check: id });
    if (next.length === points.length) {
      onEvent?.('demo_complete', { demo: 'module2_8point' });
      onComplete?.();
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="grid grid-cols-2 gap-4">
        {points.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)} className={`rounded-xl border p-4 text-left hover:shadow ${checked.includes(p.id) ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
            <svg width="56" height="56" aria-hidden>
              <use href={iconHref(p.id)} />
            </svg>
            <div className="mt-2 font-medium">{checked.includes(p.id) ? '✓ ' : ''}{p.label}</div>
          </button>
        ))}
      </div>
      <div className="grid gap-3 text-sm text-slate-700">
        <h3 className="text-base font-medium">Checklist</h3>
        <ol className="list-decimal pl-5 space-y-1">
          {points.map(p => <li key={p.id}>{checked.includes(p.id) ? '✓ ' : ''}{p.label}</li>)}
        </ol>
        {done && <div className="rounded-lg bg-green-50 border border-green-300 p-4">Inspection complete. Log your results.</div>}
      </div>
    </div>
  );
}
