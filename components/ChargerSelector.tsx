import { useEffect, useMemo, useState } from 'react';
import type { Speed } from '@/lib/recsUtil';
import { ampsFrom } from '@/lib/recsUtil';

export default function ChargerSelector({ onFilterChange }: { onFilterChange: (f: { voltage?: number|null; amps?: number|null; phase?: '1P'|'3P'|null; speed?: Speed }) => void }){
  const [voltage, setVoltage] = useState('');
  const [speed, setSpeed] = useState<Speed>('overnight');
  const [phase, setPhase] = useState<'1P'|'3P'|''>('');

  const computedAmps = useMemo(()=> ampsFrom(voltage ? Number(voltage) : null, speed), [voltage, speed]);

  useEffect(() => {
    onFilterChange({ voltage: voltage ? Number(voltage) : null, amps: computedAmps ?? null, phase: phase || null, speed });
  }, [voltage, computedAmps, phase, speed, onFilterChange]);

  const btnBase = 'rounded-lg border p-3 text-left transition';
  const active = 'border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)] bg-[color:color-mix(in_srgb,var(--brand-accent)_6%,white)]';
  const inactive = 'border-[var(--brand-border)] hover:bg-[var(--brand-chip)]';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Step 1: Battery Voltage</label>
        <select value={voltage} onChange={(e)=>setVoltage(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--brand-border)] p-2">
          <option value="">Select voltage</option>
          {[24,36,48,80].map(v => <option key={v} value={String(v)}>{v}V</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Step 2: Charge Speed</label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={()=>setSpeed('overnight')} className={`${btnBase} ${speed==='overnight' ? active : inactive}`} aria-pressed={speed==='overnight'}>
            <div className="font-semibold">Standard Overnight</div>
            <div className="text-xs text-[var(--brand-muted)]">Typical 8–12 hours</div>
          </button>
          <button type="button" onClick={()=>setSpeed('fast')} className={`${btnBase} ${speed==='fast' ? active : inactive}`} aria-pressed={speed==='fast'}>
            <div className="font-semibold">Faster Charge</div>
            <div className="text-xs text-[var(--brand-muted)]">Roughly 4–6 hours</div>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Step 3: Facility Power (optional)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[{label:'Single‑phase (208–240V)', val:'1P'},{label:'Three‑phase (480/600V)', val:'3P'}].map(o => (
            <button key={o.val} type="button" onClick={()=>setPhase(o.val as any)} className={`rounded-lg border px-3 py-2 text-sm transition ${phase===o.val ? active : inactive}`} aria-pressed={phase===o.val}>{o.label}</button>
          ))}
          <button type="button" onClick={()=>setPhase('' as any)} className={`rounded-lg border px-3 py-2 text-sm transition ${phase==='' ? active : inactive}`} aria-pressed={phase===''}>Not sure</button>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-chip)]/60 p-3 text-sm">
        <span className="font-medium">Recommended charger output:</span> {computedAmps ? <span> {computedAmps} A</span> : <span className="text-[var(--brand-muted)]"> Select voltage & speed</span>}
      </div>
    </div>
  );
}