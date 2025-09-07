'use client';
import React from 'react';
import { useAsset } from '@/lib/useAsset';
import { track } from '@/lib/track';

type Props = { onComplete?: () => void };
export default function ControlsHotspots({ onComplete }: Props) {
  const targets = [
    { key: 'ctrl_horn' as const, label: 'Horn' },
    { key: 'ctrl_parking' as const, label: 'Parking brake' },
    { key: 'ctrl_ignition' as const, label: 'Ignition' },
    { key: 'ctrl_lift' as const, label: 'Lift' }
  ];
  const [found, setFound] = React.useState<Record<string, boolean>>({});
  const done = targets.every(t => found[t.key]);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true;
      track('demo_complete', { module: 1, demo: 'controls_hotspots' });
      onComplete?.();
    }
  }, [done, onComplete]);

  // Pre-compute all assets at component level
  const hornAsset = useAsset('ctrl_horn', { sprite: true });
  const brakeAsset = useAsset('ctrl_parking', { sprite: true });
  const ignitionAsset = useAsset('ctrl_ignition', { sprite: true });
  const liftAsset = useAsset('ctrl_lift', { sprite: true });
  
  const assets = [
    { ...targets[0], asset: hornAsset },
    { ...targets[1], asset: brakeAsset },
    { ...targets[2], asset: ignitionAsset },
    { ...targets[3], asset: liftAsset }
  ];

  return (
    <div className="grid gap-3">
      <div className="text-sm text-slate-600">Tap each control.</div>
      <div className="flex flex-wrap gap-6">
        {assets.map(t => {
          const hit = !!found[t.key];
          return (
            <button key={t.key} aria-label={t.label}
              className={`grid place-items-center rounded-xl border px-4 py-3 ${hit ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
              onClick={() => setFound(s => ({ ...s, [t.key]: true }))}>
              <svg width="88" height="88" role="img" aria-hidden="true">
                <use href={`${t.asset.file}${t.asset.frag}`} />
              </svg>
              <span className="mt-2 text-xs">{t.label}</span>
            </button>
          );
        })}
      </div>
      {done && <div className="text-sm text-green-700">Controls identified.</div>}
    </div>
  );
}
