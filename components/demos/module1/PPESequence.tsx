'use client';
import React from 'react';
import { useAsset } from '@/lib/useAsset';
import AnimatedSvg from '@/components/common/AnimatedSvg';
import { track } from '@/lib/track';

type Props = { onComplete?: () => void };
export default function PPESequence({ onComplete }: Props) {
  const steps = [
    { key: 'ppe_vest' as const, label: 'Hi-vis vest' },
    { key: 'ppe_hardhat' as const, label: 'Hard hat' },
    { key: 'ppe_goggles' as const, label: 'Eye protection' },
    { key: 'ppe_seatbelt' as const, label: 'Seatbelt' }
  ];
  const [idx, setIdx] = React.useState(0);
  const done = idx >= steps.length;
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true; // guarantee single fire
      track('demo_complete', { module: 1, demo: 'ppe_sequence' });
      onComplete?.();
    }
  }, [done, onComplete]);

  // Pre-compute all assets at component level
  const vestAsset = useAsset('ppe_vest', { sprite: true });
  const hatAsset = useAsset('ppe_hardhat', { sprite: true });
  const gogglesAsset = useAsset('ppe_goggles', { sprite: true });
  const seatbeltStepAsset = useAsset('ppe_seatbelt', { sprite: true });
  const seatbeltAnimAsset = useAsset('anim_seatbelt');
  
  const assets = [
    { ...steps[0], asset: vestAsset },
    { ...steps[1], asset: hatAsset },
    { ...steps[2], asset: gogglesAsset },
    { ...steps[3], asset: seatbeltStepAsset }
  ];

  return (
    <div className="grid gap-4">
      <div className="text-sm text-slate-600">Tap the correct PPE in order.</div>
      <div className="flex flex-wrap gap-8 items-center">
        {assets.map((s, i) => {
          const selected = i < idx;
          return (
            <button key={s.key} aria-label={s.label} disabled={selected || done}
              onClick={() => { if (i === idx) setIdx(v => v + 1); track('sim_param_change', { module: 1, name: 'ppe_step', value: i }); }}
              className={`group grid place-items-center rounded-xl border px-4 py-3 ${selected ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <svg width="88" height="88" role="img" aria-hidden="true">
                <use href={`${s.asset.file}${s.asset.frag}`} />
              </svg>
              <span className="mt-2 text-xs">{s.label}</span>
            </button>
          );
        })}
      </div>
      {done && (
        <div className="flex items-center gap-3 text-green-700 text-sm">
          <span className="i-lucide-check-circle" aria-hidden /> PPE complete.
        </div>
      )}
      <div className="mt-4">
        <AnimatedSvg src={seatbeltAnimAsset.file} title="Seatbelt latch" />
      </div>
    </div>
  );
}
