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

  const hasSelections = voltage || speed !== 'overnight' || phase;
  
  return (
    <div className="space-y-6">
      {/* Enhanced Sticky Summary */}
      <div className="selection-sticky -mx-4 px-4 py-3 sm:mx-0 sm:rounded-xl sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-accent text-white text-sm font-bold flex items-center justify-center">
                ⚡
              </div>
              <div>
                <div className="font-semibold text-brand-ink">Finding Your Charger</div>
                <div className="text-xs text-brand-muted">
                  {voltage ? `${voltage}V battery` : 'Select voltage'} • 
                  {speed === 'overnight' ? ' Overnight charge' : ' Fast charge'} • 
                  {phase === '1P' ? ' Single-phase' : phase === '3P' ? ' Three-phase' : ' Any power type'}
                  {computedAmps && ` • ~${computedAmps}A output`}
                </div>
              </div>
            </div>
          </div>
          {hasSelections && (
            <button 
              onClick={() => { setVoltage(''); setSpeed('overnight'); setPhase(''); }}
              className="text-xs text-brand-muted hover:text-brand-ink transition-colors px-2 py-1 rounded hover:bg-white/50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Step Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Step 1 - Enhanced */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-accent text-white text-sm font-bold flex items-center justify-center">1</div>
            <div>
              <h3 className="font-semibold text-brand-ink">Battery Voltage</h3>
              <p className="text-xs text-brand-muted">What voltage is your forklift battery?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[24,36,48,80].map(v => (
              <Tile key={v} active={voltage===String(v)} label={`${v}V`} onClick={()=>setVoltage(voltage===String(v) ? '' : String(v))} ariaLabel={`Select ${v} volt battery`} />
            ))}
          </div>
        </div>

        {/* Step 2 - Enhanced */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-accent text-white text-sm font-bold flex items-center justify-center">2</div>
            <div>
              <h3 className="font-semibold text-brand-ink">Charge Speed</h3>
              <p className="text-xs text-brand-muted">How quickly do you need to charge?</p>
            </div>
          </div>
          <div className="space-y-2">
            <Tile active={speed==='overnight'} label="Standard Overnight" sub="8–12 hours • Gentler on battery • Most common" onClick={()=>setSpeed('overnight')} ariaLabel="Select standard overnight charging" />
            <Tile active={speed==='fast'} label="Fast Charge" sub="4–6 hours • Higher current • Quick turnaround" onClick={()=>setSpeed('fast')} ariaLabel="Select fast charging" />
          </div>
        </div>

        {/* Step 3 - Enhanced */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-accent text-white text-sm font-bold flex items-center justify-center">3</div>
            <div>
              <h3 className="font-semibold text-brand-ink">Facility Power</h3>
              <p className="text-xs text-brand-muted">What power input is available?</p>
            </div>
          </div>
          <div className="space-y-2">
            <Tile active={phase==='1P'} label="Single-phase" sub="208–240V • Most common • Residential style" onClick={()=>setPhase(phase==='1P' ? '' : '1P')} ariaLabel="Select single phase power" />
            <Tile active={phase==='3P'} label="Three-phase" sub="480V/600V • Industrial • More efficient" onClick={()=>setPhase(phase==='3P' ? '' : '3P')} ariaLabel="Select three phase power" />
            <Tile active={phase===''} label="Not sure" sub="Show all compatible options" onClick={()=>setPhase('')} ariaLabel="Show all power options" />
          </div>
        </div>
      </div>

      {/* Enhanced Recommendation Summary */}
      {voltage && (
        <div className="rounded-xl border border-brand-accent/20 bg-gradient-to-r from-brand-accent/5 to-brand-accent/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              🎯
            </div>
            <div className="flex-1">
              <div className="font-semibold text-brand-ink">Recommended Output</div>
              <div className="text-sm text-brand-muted">
                {computedAmps ? (
                  <>
                    <span className="font-medium text-brand-accent">~{computedAmps}A charger</span> for your {voltage}V battery with {speed} charging
                  </>
                ) : (
                  'Select voltage and charge speed for personalized recommendation'
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}