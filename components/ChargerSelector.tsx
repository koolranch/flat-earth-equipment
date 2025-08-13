"use client";

import { useEffect, useMemo, useState } from 'react';

export default function ChargerSelector({ 
  onFilterChange,
  resultsCount,
  onNotSureClick,
  showBestMatchLabel = false
}: { 
  onFilterChange: (f: { 
    voltage?: number | null; 
    amps?: number | null; 
    phase?: '1P' | '3P' | null; 
    speed?: 'overnight' | 'fast' | null 
  }) => void;
  resultsCount: number;
  onNotSureClick: () => void;
  showBestMatchLabel?: boolean;
}) {
  const [voltage, setVoltage] = useState('');
  const [speed, setSpeed] = useState<'overnight' | 'fast'>('overnight');
  const [phase, setPhase] = useState<'1P' | '3P' | ''>('');

  const assumedAhByVoltage: Record<string, number> = { '24': 600, '36': 750, '48': 750, '80': 1000 };
  const baseAh = useMemo(() => (voltage ? assumedAhByVoltage[voltage] ?? null : null), [voltage]);
  const recommendedAmps = useMemo(() => baseAh ? Math.max(10, Math.round(baseAh / (speed === 'overnight' ? 10 : 5))) : null, [baseAh, speed]);

  useEffect(() => {
    onFilterChange({ 
      voltage: voltage ? Number(voltage) : null, 
      amps: recommendedAmps ?? null, 
      phase: phase || null, 
      speed 
    });
  }, [voltage, recommendedAmps, phase, speed, onFilterChange]);

  const btnBase = 'rounded-lg border p-3 text-left transition-all';
  const active = 'border-brand-accent ring-1 ring-brand-accent bg-[color:color-mix(in_srgb,var(--brand-accent)_6%,white)]';
  const inactive = 'border-brand-border hover:bg-brand-chip';

  return (
    <div className="space-y-4">
      {/* Step 1: Voltage */}
      <div>
        <label className="block text-sm font-medium text-brand-ink">Step 1: Battery Voltage</label>
        <select 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)} 
          className="mt-1 w-full rounded-md border border-brand-border p-2 bg-brand-card focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
        >
          <option value="">Select voltage</option>
          {[24, 36, 48, 80].map(v => <option key={v} value={String(v)}>{v}V</option>)}
        </select>
        <p className="mt-1 text-xs text-brand-muted">If you're not sure, check the forklift battery label or manual.</p>
      </div>

      {/* Step 2: Charge Speed */}
      <div>
        <label className="block text-sm font-medium text-brand-ink">Step 2: Charge Speed</label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button 
            type="button" 
            onClick={() => setSpeed('overnight')} 
            className={`${btnBase} ${speed === 'overnight' ? active : inactive}`}
            aria-pressed={speed === 'overnight'}
          >
            <div className="font-semibold">Standard Overnight</div>
            <div className="text-xs text-brand-muted">Typical 8–12 hours</div>
          </button>
          <button 
            type="button" 
            onClick={() => setSpeed('fast')} 
            className={`${btnBase} ${speed === 'fast' ? active : inactive}`}
            aria-pressed={speed === 'fast'}
          >
            <div className="font-semibold">Faster Charge</div>
            <div className="text-xs text-brand-muted">Roughly 4–6 hours</div>
          </button>
        </div>
      </div>

      {/* Step 3: Facility Power */}
      <div>
        <label className="block text-sm font-medium text-brand-ink">Step 3: Facility Power (optional)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: 'Single-phase (208–240V)', val: '1P' },
            { label: 'Three-phase (480/600V)', val: '3P' }
          ].map(o => (
            <button 
              key={o.val} 
              type="button" 
              onClick={() => setPhase(o.val as any)} 
              className={`rounded-lg border px-3 py-2 text-sm transition-all ${phase === o.val ? active : inactive}`}
              aria-pressed={phase === o.val}
            >
              {o.label}
            </button>
          ))}
          <button 
            type="button" 
            onClick={() => setPhase('' as any)} 
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${phase === '' ? active : inactive}`}
            aria-pressed={phase === ''}
          >
            Not sure
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-brand-border bg-[var(--brand-chip)]/60 p-3 text-sm">
        <span className="font-medium">Recommended charger output:</span>{' '}
        {recommendedAmps ? (
          <span className="text-brand-accent font-semibold">{recommendedAmps} A</span>
        ) : (
          <span className="text-brand-muted">Select voltage & speed</span>
        )}
      </div>

      {/* Results Counter & Help Link */}
      <div className="mt-6 pt-6 border-t border-brand-border flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-brand-ink">
            Showing {resultsCount} compatible charger{resultsCount !== 1 ? "s" : ""}
            {showBestMatchLabel && resultsCount > 0 && (
              <span className="text-brand-muted"> (Best Match)</span>
            )}
          </span>
          {!showBestMatchLabel && resultsCount > 0 && resultsCount <= 3 && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Best Match
            </span>
          )}
        </div>

        <button
          onClick={onNotSureClick}
          className="inline-flex items-center gap-1 text-sm text-brand-accent hover:text-brand-accentHover font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Not sure? Get help
        </button>
      </div>
    </div>
  );
}