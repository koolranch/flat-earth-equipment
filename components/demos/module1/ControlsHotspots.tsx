'use client';
import React from 'react';
import { assetUrl } from '@/lib/assets';
import { track } from '@/lib/track';

type Props = { onComplete?: () => void };
export default function ControlsHotspots({ onComplete }: Props) {
  const targets = [
    { key: 'ctrl_horn' as const, label: 'Horn', tip: 'Test before first move — your primary warning device' },
    { key: 'ctrl_parking' as const, label: 'Parking brake', tip: 'Always set when stopped — prevents roll-away accidents' },
    { key: 'ctrl_ignition' as const, label: 'Ignition', tip: 'Know key positions: OFF, RUN, START' },
    { key: 'ctrl_lights' as const, label: 'Lights', tip: 'Required in low-visibility areas and when reversing' }
  ];
  const [found, setFound] = React.useState<Record<string, boolean>>({});
  const [lastTip, setLastTip] = React.useState<string | null>(null);
  const done = targets.every(t => found[t.key]);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (done && !firedRef.current) {
      firedRef.current = true;
      track('demo_complete', { module: 1, demo: 'controls_hotspots' });
      onComplete?.();
    }
  }, [done, onComplete]);

  // Direct SVG paths - each control has its own distinct icon
  const assets = [
    { ...targets[0], svgPath: assetUrl('training/c3-control-horn.svg') },
    { ...targets[1], svgPath: assetUrl('training/animations/d2-parking-brake.svg') },
    { ...targets[2], svgPath: assetUrl('training/c3-control-ignition.svg') },
    { ...targets[3], svgPath: assetUrl('training/c3-control-lights.svg') }
  ];

  const handleTap = (key: string, tip: string) => {
    setFound(s => ({ ...s, [key]: true }));
    setLastTip(tip);
    track('sim_param_change', { module: 1, name: 'control_tap', value: key });
  };

  const foundCount = Object.values(found).filter(Boolean).length;

  return (
    <div className="grid gap-4">
      <div className="text-sm text-slate-600">
        <span className="font-medium">Tap each control</span> to learn what it does. 
        <span className="text-slate-400 ml-2">({foundCount}/{targets.length} identified)</span>
      </div>
      <div className="flex flex-wrap gap-6 items-start">
        {assets.map(t => {
          const hit = !!found[t.key];
          return (
            <div key={t.key} className="flex flex-col items-center">
              <button 
                aria-label={t.label}
                disabled={hit}
                className={`grid place-items-center rounded-xl border px-4 py-3 transition-all ${
                  hit 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-slate-200 hover:bg-slate-50 hover:border-[#F76511]'
                }`}
                onClick={() => handleTap(t.key, t.tip)}
              >
                <img 
                  src={t.svgPath} 
                  alt={t.label}
                  width="88" 
                  height="88"
                  className="w-[88px] h-[88px]"
                />
                <span className="mt-2 text-xs font-medium">{t.label}</span>
              </button>
              {/* Show checkmark for identified items */}
              {hit && (
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
          <span><strong>Controls identified!</strong> Know your controls before every shift — it's the foundation of safe operation.</span>
        </div>
      )}
    </div>
  );
}
