import { useEffect, useMemo, useState } from 'react';
import { Check, Zap, Clock, Power, HelpCircle } from 'lucide-react';
import type { Speed } from '@/lib/recsUtil';
import { ampsFrom } from '@/lib/recsUtil';

export default function ChargerSelector({ onFilterChange }: { onFilterChange: (f: { voltage?: number|null; amps?: number|null; phase?: '1P'|'3P'|null; speed?: Speed }) => void }){
  const [voltage, setVoltage] = useState('');
  const [speed, setSpeed] = useState<Speed | ''>('');
  const [phase, setPhase] = useState<'1P'|'3P'|''>('');

  const computedAmps = useMemo(()=> ampsFrom(voltage ? Number(voltage) : null, speed || undefined), [voltage, speed]);

  useEffect(() => { onFilterChange({ voltage: voltage ? Number(voltage) : null, amps: computedAmps ?? null, phase: phase || null, speed: speed || undefined }); }, [voltage, computedAmps, phase, speed, onFilterChange]);

  function VoltageCard({active, voltage, onClick}: {active: boolean; voltage: number; onClick: () => void}) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        aria-pressed={active}
        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
          active 
            ? 'border-canyon-rust bg-canyon-rust text-white shadow-md' 
            : 'border-gray-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`text-3xl font-black mb-1 ${active ? 'text-white' : 'text-gray-900'}`}>
            {voltage}V
          </div>
          <div className={`text-sm font-medium ${active ? 'text-white/90' : 'text-gray-500'}`}>
            Battery
          </div>
          {active && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <Check className="h-3.5 w-3.5 text-canyon-rust" />
            </div>
          )}
        </div>
      </button>
    );
  }

  function SpeedCard({active, speed, label, sub, icon, onClick}: {active: boolean; speed: Speed; label: string; sub: string; icon: React.ReactNode; onClick: () => void}) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        aria-pressed={active}
        className={`group p-4 rounded-xl border-2 transition-all duration-200 text-left ${
          active 
            ? 'border-[var(--brand-accent)] bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg transform -translate-y-1' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            active ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold mb-1 ${active ? 'text-[var(--brand-accent)]' : 'text-gray-900'}`}>
              {label}
            </div>
            <div className={`text-sm leading-relaxed ${active ? 'text-orange-700' : 'text-gray-500'}`}>
              {sub}
            </div>
          </div>
          {active && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-[var(--brand-accent)] rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </div>
      </button>
    );
  }

  function PhaseCard({active, phase, label, sub, icon, onClick}: {active: boolean; phase: string; label: string; sub: string; icon: React.ReactNode; onClick: () => void}) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        aria-pressed={active}
        className={`group p-4 rounded-xl border-2 transition-all duration-200 text-left ${
          active 
            ? 'border-[var(--brand-accent)] bg-orange-50/80 shadow-md' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            active ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold mb-1 ${active ? 'text-[var(--brand-accent)]' : 'text-gray-900'}`}>
              {label}
            </div>
            <div className={`text-sm leading-relaxed ${active ? 'text-slate-700' : 'text-gray-500'}`}>
              {sub}
            </div>
          </div>
          {active && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-[var(--brand-accent)] rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </div>
      </button>
    );
  }

  const hasSelections = voltage || speed || phase;
  // Count steps completed by user interaction
  const completedSteps = (voltage ? 1 : 0) + (speed ? 1 : 0) + (phase ? 1 : 0);
  const progress = (completedSteps / 3) * 100;
  
  return (
    <div className="space-y-8">
      {/* Enhanced Progress Header */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-canyon-rust text-white flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Finding Your Perfect Charger</h3>
              <p className="text-gray-600">
                Answer 3 questions • Step {completedSteps} of 3 complete
              </p>
            </div>
          </div>
          {hasSelections && (
            <button 
              onClick={() => { setVoltage(''); setSpeed(''); setPhase(''); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-canyon-rust h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className={`px-3 py-1 rounded-full border ${voltage ? 'bg-canyon-rust/10 text-canyon-rust border-canyon-rust/20' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {voltage ? `${voltage}V battery` : 'Select voltage'}
          </span>
          <span className={`px-3 py-1 rounded-full border ${speed ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {speed === 'overnight' ? 'Overnight charging' : speed === 'fast' ? 'Fast charging' : 'Select speed'}
          </span>
          <span className={`px-3 py-1 rounded-full border ${phase ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {phase === '1P' ? 'Single-phase' : phase === '3P' ? 'Three-phase' : 'Any power type'}
          </span>
          {computedAmps && (
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white border border-slate-900">
              ~{computedAmps}A output
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Step Grid */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Step 1 - Battery Voltage */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-200 ${
              voltage ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {voltage ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Battery Voltage</h3>
              <p className="text-gray-600">What voltage is your forklift battery?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[24, 36, 48, 80].map(v => (
              <VoltageCard 
                key={v}
                active={voltage === String(v)}
                voltage={v}
                onClick={() => setVoltage(voltage === String(v) ? '' : String(v))}
              />
            ))}
          </div>
        </div>

        {/* Step 2 - Charge Speed */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-200 ${
              voltage ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {voltage ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Charge Speed</h3>
              <p className="text-gray-600">How quickly do you need to charge?</p>
            </div>
          </div>
          <div className="space-y-3">
            <SpeedCard 
              active={speed === 'overnight'}
              speed="overnight"
              label="Standard Overnight"
              sub="8–12 hours • Gentler on battery • Most common"
              icon={<Clock className="h-4 w-4" />}
              onClick={() => setSpeed('overnight')}
            />
            <SpeedCard 
              active={speed === 'fast'}
              speed="fast"
              label="Fast Charge"
              sub="4–6 hours • Higher current • Quick turnaround"
              icon={<Zap className="h-4 w-4" />}
              onClick={() => setSpeed('fast')}
            />
          </div>
        </div>

        {/* Step 3 - Facility Power */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-200 ${
              phase ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {phase ? <Check className="h-5 w-5" /> : '3'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Facility Power</h3>
              <p className="text-gray-600">What power input is available?</p>
            </div>
          </div>
          <div className="space-y-3">
            <PhaseCard 
              active={phase === '1P'}
              phase="1P"
              label="Single-phase"
              sub="208–240V • Most common • Residential style"
              icon={<Power className="h-4 w-4" />}
              onClick={() => setPhase(phase === '1P' ? '' : '1P')}
            />
            <PhaseCard 
              active={phase === '3P'}
              phase="3P"
              label="Three-phase"
              sub="480V/600V • Industrial • More efficient"
              icon={<Zap className="h-4 w-4" />}
              onClick={() => setPhase(phase === '3P' ? '' : '3P')}
            />
            <PhaseCard 
              active={phase === ''}
              phase=""
              label="Not sure"
              sub="Show all compatible options"
              icon={<HelpCircle className="h-4 w-4" />}
              onClick={() => setPhase('')}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Recommendation Summary */}
      {voltage && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Ready to Find Your Charger</h4>
              {computedAmps ? (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Based on your selections, we recommend a{' '}
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      ~{computedAmps}A charger
                    </span>{' '}
                    for your {voltage}V battery with {speed} charging.
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white px-3 py-1 rounded-full border border-emerald-200 text-emerald-700">
                      ⚡ {voltage}V Compatible
                    </span>
                    <span className="bg-white px-3 py-1 rounded-full border border-emerald-200 text-emerald-700">
                      ⏱️ {speed === 'overnight' ? 'Overnight' : 'Fast'} Charging
                    </span>
                    {phase && (
                      <span className="bg-white px-3 py-1 rounded-full border border-emerald-200 text-emerald-700">
                        🔌 {phase === '1P' ? 'Single' : 'Three'}-phase
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Complete your selections above to see personalized charger recommendations.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}