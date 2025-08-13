import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { Speed } from '@/lib/recsUtil';
import { ampsFrom } from '@/lib/recsUtil';

export default function ChargerSelector({ onFilterChange }: { onFilterChange: (f: { voltage?: number|null; amps?: number|null; phase?: '1P'|'3P'|null; speed?: Speed }) => void }){
  const [voltage, setVoltage] = useState('');
  const [speed, setSpeed] = useState<Speed>('overnight');
  const [phase, setPhase] = useState<'1P'|'3P'|''>('');

  const computedAmps = useMemo(()=> ampsFrom(voltage ? Number(voltage) : null, speed), [voltage, speed]);

  useEffect(() => { onFilterChange({ voltage: voltage ? Number(voltage) : null, amps: computedAmps ?? null, phase: phase || null, speed }); }, [voltage, computedAmps, phase, speed, onFilterChange]);

  function Tile({active, label, sub, onClick, ariaLabel}:{active:boolean; label:string; sub?:string; onClick:()=>void; ariaLabel:string}){
    return (
      <button type="button" onClick={onClick} aria-pressed={active} aria-label={ariaLabel}
        className={`sel-btn ${active ? 'sel-active' : 'sel-inactive hover:sel-hover'}`}
      >
        <div className="flex items-start gap-2">
          <span className={`sel-icon ${active ? 'sel-check' : 'sel-empty'}`}>{active ? <Check className="h-3.5 w-3.5"/> : null}</span>
          <div>
            <div className="font-semibold">{label}</div>
            {sub && <div className={`text-xs ${!active ? 'text-[var(--brand-muted)]' : ''}`}>{sub}</div>}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky summary (md+) */}
      <div className="hidden md:block selection-sticky -mx-4 px-4 py-2 text-sm">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-2">
          <span className="text-[var(--brand-muted)]">Your selections:</span>
          {voltage && <span className="brand-chip">{voltage}V</span>}
          <span className="brand-chip">{speed==='overnight' ? 'Overnight' : 'Fast'}</span>
          <span className="brand-chip">{phase==='1P' ? 'Single‑phase' : phase==='3P' ? 'Three‑phase' : 'Phase: Not sure'}</span>
          {computedAmps && <span className="brand-chip">~{computedAmps} A</span>}
        </div>
      </div>

      {/* Step 1 */}
      <div>
        <label className="block text-sm font-medium mb-1">Step 1: Battery Voltage</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[24,36,48,80].map(v => (
            <Tile key={v} active={voltage===String(v)} label={`${v}V`} onClick={()=>setVoltage(String(v))} ariaLabel={`Select ${v} volt`} />
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div>
        <label className="block text-sm font-medium mb-1">Step 2: Charge Speed</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Tile active={speed==='overnight'} label="Standard Overnight" sub="Typical 8–12 hours" onClick={()=>setSpeed('overnight')} ariaLabel="Select standard overnight" />
          <Tile active={speed==='fast'} label="Faster Charge" sub="Roughly 4–6 hours" onClick={()=>setSpeed('fast')} ariaLabel="Select faster charge" />
        </div>
      </div>

      {/* Step 3 */}
      <div>
        <label className="block text-sm font-medium mb-1">Step 3: Facility Power (optional)</label>
        <div className="flex flex-wrap gap-2">
          <Tile active={phase==='1P'} label="Single‑phase (208–240V)" onClick={()=>setPhase('1P')} ariaLabel="Select single phase" />
          <Tile active={phase==='3P'} label="Three‑phase (480/600V)" onClick={()=>setPhase('3P')} ariaLabel="Select three phase" />
          <Tile active={phase===''} label="Not sure" onClick={()=>setPhase('' as any)} ariaLabel="Select not sure" />
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-chip)]/60 p-3 text-sm">
        <span className="font-medium">Recommended charger output:</span>{' '}
        {computedAmps ? <span>~{computedAmps} A</span> : <span className="text-[var(--brand-muted)]">Select voltage & speed</span>}
      </div>
    </div>
  );
}