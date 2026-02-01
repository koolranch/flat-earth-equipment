'use client';
import React from 'react';
import { assetUrl } from '@/lib/assets';
import AnimatedSvg from '@/components/common/AnimatedSvg';
import { track } from '@/lib/track';

type Props = { onComplete?: () => void };
export default function PPESequence({ onComplete }: Props) {
  const steps = [
    { key: 'ppe_vest' as const, label: 'Hi-vis vest', tip: 'High visibility keeps you seen in busy work areas' },
    { key: 'ppe_hardhat' as const, label: 'Hard hat', tip: 'Protects from falling objects and overhead hazards' },
    { key: 'ppe_goggles' as const, label: 'Eye protection', tip: 'Shields eyes from debris, dust, and hydraulic fluid' },
    { key: 'ppe_seatbelt' as const, label: 'Seatbelt', tip: 'OSHA requires seatbelts — always buckle before moving' }
  ];
  const [idx, setIdx] = React.useState(0);
  const [lastTip, setLastTip] = React.useState<string | null>(null);
  const done = idx >= steps.length;
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true; // guarantee single fire
      track('demo_complete', { module: 1, demo: 'ppe_sequence' });
      onComplete?.();
    }
  }, [done, onComplete]);

  // Direct SVG paths (no fragments - SVGs don't have symbol IDs)
  const assets = [
    { ...steps[0], svgPath: assetUrl('training/c1-ppe-vest.svg') },
    { ...steps[1], svgPath: assetUrl('training/c1-ppe-hardhat.svg') },
    { ...steps[2], svgPath: assetUrl('training/c1-ppe-goggles.svg') },
    { ...steps[3], svgPath: assetUrl('training/animations/d1-seatbelt.svg') }
  ];

  const handleTap = (i: number, tip: string) => {
    if (i === idx) {
      setIdx(v => v + 1);
      setLastTip(tip);
      track('sim_param_change', { module: 1, name: 'ppe_step', value: i });
    }
  };

  return (
    <div className="grid gap-4">
      <div className="text-sm text-slate-600">
        <span className="font-medium">Tap PPE in the order you'd put them on</span> before operating a forklift.
      </div>
      <div className="flex flex-wrap gap-6 items-start">
        {assets.map((s, i) => {
          const selected = i < idx;
          const isNext = i === idx && !done;
          return (
            <div key={s.key} className="flex flex-col items-center">
              <button 
                aria-label={s.label} 
                disabled={selected || done}
                onClick={() => handleTap(i, s.tip)}
                className={`group grid place-items-center rounded-xl border px-4 py-3 transition-all ${
                  selected 
                    ? 'border-green-400 bg-green-50' 
                    : isNext 
                      ? 'border-[#F76511] bg-orange-50 ring-2 ring-[#F76511]/20' 
                      : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <img 
                  src={s.svgPath} 
                  alt={s.label}
                  width="88" 
                  height="88"
                  className="w-[88px] h-[88px]"
                />
                <span className="mt-2 text-xs font-medium">{s.label}</span>
              </button>
              {/* Show checkmark for completed items */}
              {selected && (
                <div className="mt-1 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Reinforcement message - shows after each tap */}
      {lastTip && !done && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{lastTip}</span>
        </div>
      )}
      
      {done && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span><strong>PPE complete!</strong> Always gear up before operating any powered industrial truck.</span>
        </div>
      )}
      <div className="mt-4">
        <AnimatedSvg src={assetUrl('training/animations/d1-seatbelt.svg')} title="Seatbelt latch" />
      </div>
    </div>
  );
}
