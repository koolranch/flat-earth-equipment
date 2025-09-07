import React from 'react';

interface Props { onEvent?: (name: string, props?: Record<string, any>) => void; onComplete?: () => void }

export default function StabilityPlayground({ onEvent, onComplete }: Props) {
  const [load, setLoad] = React.useState(600); // lbs
  const [tilt, setTilt] = React.useState(0);   // degrees

  const safe = (() => {
    // Super-simplified rule: more tilt + heavier load => riskier
    // Consider unsafe if tilt>6° and load>800, else safe
    return !(tilt > 6 && load > 800);
  })();

  React.useEffect(() => { onEvent?.('sim_param_change', { sim: 'module3_stability', load, tilt, safe }); }, [load, tilt, safe, onEvent]);

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <img src="/training/diagrams/stability.svg" alt="Stability triangle diagram" className="w-full rounded" />
        </div>
        <div className="rounded-lg border p-4 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-slate-600">Load (lbs)</span>
            <input type="range" min={200} max={1200} value={load} onChange={e => setLoad(parseInt(e.target.value))} />
            <div className="text-sm">{load} lbs</div>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-slate-600">Mast tilt (°)</span>
            <input type="range" min={-5} max={12} value={tilt} onChange={e => setTilt(parseInt(e.target.value))} />
            <div className="text-sm">{tilt}°</div>
          </label>
          <div className={`rounded-md p-3 border ${safe ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            {safe ? 'Within triangle — stable' : 'Outside triangle — tip risk'}
          </div>
          {!safe && (
            <button className="rounded-md px-3 py-2 bg-orange-600 text-white" onClick={() => { onEvent?.('demo_complete', { demo: 'module3_stability' }); onComplete?.(); }}>I understand</button>
          )}
        </div>
      </div>
      <div className="rounded-lg border p-4 text-sm text-slate-700">
        Keep the combined center of gravity inside the triangle formed by the two front wheel contact points and the pivot at the rear axle.
      </div>
    </div>
  );
}
