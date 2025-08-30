'use client';
import { useEffect, useState } from 'react';

const STEPS = [
  { key: 'vest', label: 'Vest on', icon: '🦺' },
  { key: 'hardhat', label: 'Hard hat on', icon: '⛑️' },
  { key: 'forks', label: 'Lower forks', icon: '⬇️' },
  { key: 'brake', label: 'Set parking brake', icon: '🛑' }
] as const;

export default function MiniPPE() {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    setIdx(0); 
    setDone(false); 
    setError(null);
  }, []);

  function choose(k: string) {
    if (done) return;
    
    const need = STEPS[idx].key;
    
    if (k === need) {
      const next = idx + 1;
      setIdx(next);
      setError(null);
      
      // Emit successful step completion
      window.dispatchEvent(new CustomEvent('demo:child', { 
        detail: { 
          type: 'sim_param_change', 
          step: k, 
          step_index: idx,
          step_label: STEPS[idx].label,
          ok: true 
        } 
      }));
      
      if (next >= STEPS.length) {
        setDone(true);
        // Emit demo completion
        window.dispatchEvent(new CustomEvent('demo:child', { 
          detail: { 
            type: 'demo_complete',
            total_steps: STEPS.length,
            completion_method: 'sequence_complete'
          } 
        }));
      }
    } else {
      // Show error feedback for incorrect selection
      setError(`Please complete step ${idx + 1}: ${STEPS[idx].label}`);
      
      // Emit incorrect step attempt
      window.dispatchEvent(new CustomEvent('demo:child', { 
        detail: { 
          type: 'sim_param_change', 
          step: k, 
          expected_step: need,
          step_index: idx,
          ok: false 
        } 
      }));
      
      // Clear error after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent, stepKey: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(stepKey);
    }
  }

  function reset() {
    setIdx(0);
    setDone(false);
    setError(null);
    
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'demo_interaction',
        action: 'reset',
        target: 'ppe_sequence'
      } 
    }));
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">PPE & Safe State Sequence</span>
        <span className="text-slate-600 dark:text-slate-400">
          Step {done ? STEPS.length : idx + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((done ? STEPS.length : idx) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div 
          className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-800 dark:text-red-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Step buttons */}
      <div 
        className="grid grid-cols-2 gap-3 sm:grid-cols-4" 
        role="group" 
        aria-label="PPE and safe state sequence steps"
      >
        {STEPS.map((s, i) => {
          const state = i < idx ? 'done' : (i === idx ? 'current' : 'pending');
          const isDisabled = done || (state === 'pending' && i !== idx);
          
          return (
            <button
              key={s.key}
              onClick={() => choose(s.key)}
              onKeyDown={(e) => handleKeyDown(e, s.key)}
              disabled={isDisabled}
              className={`
                rounded-xl border px-3 py-6 text-sm font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:cursor-not-allowed
                ${state === 'done' 
                  ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200' 
                  : state === 'current' 
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                }
              `}
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${s.label}${state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ' (pending)'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl" aria-hidden="true">
                  {state === 'done' ? '✅' : s.icon}
                </div>
                <div className="font-medium">{s.label}</div>
                <div className="text-xs opacity-75">
                  {i + 1} of {STEPS.length}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion message */}
      {done && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-emerald-600 dark:text-emerald-400">✓</div>
              <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                PPE sequence complete! Ready to operate safely.
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs text-emerald-600 dark:text-emerald-400 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p>
          <strong>Instructions:</strong> Complete each step in the correct order. 
          {!done && ` Next: ${STEPS[idx].label}`}
        </p>
        <p>
          Use Tab to navigate between buttons, Enter or Space to select.
        </p>
      </div>
    </div>
  );
}
