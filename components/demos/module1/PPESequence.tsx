import React from 'react';

interface Props { onComplete?: () => void; onEvent?: (name: string, props?: Record<string, any>) => void }

const steps = [
  { id: 'vest', label: 'Hi-vis vest', href: '/training/icons/ppe-sprite.svg#icon-ppe-vest' },
  { id: 'hardhat', label: 'Hard hat', href: '/training/icons/ppe-sprite.svg#icon-ppe-hardhat' },
  { id: 'brake', label: 'Set brake', href: '/training/icons/control-sprite.svg#icon-control-parking-brake' },
  { id: 'forks', label: 'Lower forks', href: '/training/icons/control-sprite.svg#icon-control-lift' }
];

export default function PPESequence({ onComplete, onEvent }: Props) {
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const handlePick = (id: string) => {
    const expected = steps[idx].id;
    const correct = id === expected;
    onEvent?.('sim_param_change', { sim: 'module1_ppe', step_attempt: id, expected, correct });
    if (!correct) return;
    const next = idx + 1;
    if (next >= steps.length) {
      setDone(true);
      onEvent?.('demo_complete', { demo: 'module1_ppe' });
      onComplete?.();
    } else {
      setIdx(next);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3 text-slate-700">
        <img src="/training/diagrams/controls.svg" alt="Forklift controls diagram" className="w-full max-w-2xl rounded-lg border" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <button key={s.id} onClick={() => handlePick(s.id)} disabled={done}
            className={`group rounded-xl border p-4 text-left hover:shadow ${i < idx ? 'bg-green-50 border-green-300' : i === idx ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}>
            <svg width="64" height="64" aria-hidden>
              <use href={s.href} />
            </svg>
            <div className="mt-2 font-medium">{i < idx ? '✓ ' : ''}{s.label}</div>
            {i === idx && <div className="text-xs text-slate-500">Tap next: {s.label}</div>}
          </button>
        ))}
      </div>
      {done && <div className="rounded-lg bg-green-50 border border-green-300 p-4">Sequence complete. Nice work.</div>}
    </div>
  );
}
