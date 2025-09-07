import React from 'react';

interface Props { onComplete?: () => void; onEvent?: (name: string, props?: Record<string, any>) => void }

const targets = [
  { id: 'wheel', x: 20, y: 30, w: 14, h: 14, label: 'Steering wheel' },
  { id: 'horn', x: 30, y: 26, w: 10, h: 10, label: 'Horn button' },
  { id: 'ignition', x: 42, y: 32, w: 10, h: 10, label: 'Ignition' },
  { id: 'brake', x: 34, y: 58, w: 12, h: 10, label: 'Parking brake' }
];

export default function ControlsIdentify({ onComplete, onEvent }: Props) {
  const [found, setFound] = React.useState<string[]>([]);
  const done = found.length === targets.length;

  const onHit = (id: string) => {
    if (found.includes(id)) return;
    const next = [...found, id];
    setFound(next);
    onEvent?.('sim_param_change', { sim: 'module1_controls', hit: id });
    if (next.length === targets.length) {
      onEvent?.('demo_complete', { demo: 'module1_controls' });
      onComplete?.();
    }
  };

  return (
    <div className="grid gap-4">
      <div className="relative w-full max-w-2xl">
        <img src="/training/diagrams/controls.svg" alt="Diagram with forklift controls" className="w-full rounded-lg border" />
        {targets.map(t => (
          <button key={t.id} aria-label={t.label}
            onClick={() => onHit(t.id)}
            className={`absolute ring-2 ${found.includes(t.id) ? 'ring-green-500 bg-green-200/40' : 'ring-orange-500 bg-orange-200/40'} rounded-md`}
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`, height: `${t.h}%` }} />
        ))}
      </div>
      <ul className="text-sm text-slate-700 list-disc pl-6">
        {targets.map(t => <li key={t.id}>{found.includes(t.id) ? '✓ ' : ''}{t.label}</li>)}
      </ul>
      {done && <div className="rounded-lg bg-green-50 border border-green-300 p-4">All controls identified.</div>}
    </div>
  );
}
