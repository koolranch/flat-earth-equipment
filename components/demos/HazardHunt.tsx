'use client';
import { useMemo, useState } from 'react';

const ALL = [
  { key: 'pedestrians', label: 'Pedestrians in aisle', hazard: true },
  { key: 'blind-corner', label: 'Blind corner', hazard: true },
  { key: 'spill', label: 'Floor spill', hazard: true },
  { key: 'overhead', label: 'Overhead obstacle', hazard: true },
  { key: 'unstable-load', label: 'Unstable load', hazard: true },
  { key: 'speed-zone', label: 'High-speed zone', hazard: true },
  { key: 'ramp', label: 'Ramp/grade', hazard: true },
  { key: 'battery-area', label: 'Battery charge area', hazard: true },
  { key: 'clear-aisle', label: 'Clear aisle', hazard: false },
  { key: 'parked-safely', label: 'Parked, forks down', hazard: false },
  { key: 'marked-ped', label: 'Marked pedestrian path', hazard: false },
  { key: 'good-light', label: 'Good lighting', hazard: false }
];

export default function HazardHunt() {
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  
  const correctCount = useMemo(() => ALL.filter(x => x.hazard && sel[x.key]).length, [sel]);
  const threshold = 8;

  function toggle(k: string) {
    if (completed) return;
    
    setSel(prev => { 
      const next = { ...prev, [k]: !prev[k] };
      
      // Emit analytics for each toggle
      window.dispatchEvent(new CustomEvent('demo:child', { 
        detail: { 
          type: 'sim_param_change', 
          item: k, 
          value: next[k],
          is_hazard: ALL.find(x => x.key === k)?.hazard || false,
          correct_count: ALL.filter(x => x.hazard && next[x.key]).length,
          threshold: threshold
        } 
      }));
      
      // Check completion
      const correct = ALL.filter(x => x.hazard && next[x.key]).length;
      if (correct >= threshold && !completed) {
        setCompleted(true);
        window.dispatchEvent(new CustomEvent('demo:child', { 
          detail: { 
            type: 'demo_complete',
            correct_hazards: correct,
            total_selections: Object.values(next).filter(Boolean).length,
            accuracy: Math.round((correct / Object.values(next).filter(Boolean).length) * 100),
            completion_method: 'hazard_threshold_reached'
          } 
        }));
      }
      
      return next; 
    });
  }

  function reset() {
    setSel({});
    setCompleted(false);
    
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'demo_interaction',
        action: 'reset',
        target: 'hazard_hunt'
      } 
    }));
  }

  function handleKeyDown(event: React.KeyboardEvent, itemKey: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(itemKey);
    }
  }

  const totalSelected = Object.values(sel).filter(Boolean).length;
  const incorrectCount = totalSelected - correctCount;

  return (
    <section className="space-y-4">
      
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Find hazards: {Math.min(correctCount, threshold)}/{threshold}
          {incorrectCount > 0 && (
            <span className="ml-2 text-red-600 dark:text-red-400">
              ({incorrectCount} incorrect)
            </span>
          )}
        </div>
        {totalSelected > 0 && (
          <button
            onClick={reset}
            className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((correctCount / threshold) * 100, 100)}%` }}
        />
      </div>

      {/* Hazard Grid */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 gap-2" 
        role="group" 
        aria-label="Warehouse conditions to evaluate"
      >
        {ALL.map(item => {
          const isSelected = !!sel[item.key];
          const isCorrectSelection = item.hazard && isSelected;
          const isIncorrectSelection = !item.hazard && isSelected;
          
          return (
            <button 
              key={item.key} 
              onClick={() => toggle(item.key)} 
              onKeyDown={(e) => handleKeyDown(e, item.key)}
              aria-pressed={isSelected}
              disabled={completed}
              className={`
                rounded-xl border px-3 py-6 text-left text-sm transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:cursor-not-allowed
                ${isCorrectSelection 
                  ? 'bg-amber-50 dark:bg-amber-900 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200' 
                  : isIncorrectSelection 
                  ? 'bg-red-50 dark:bg-red-900 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200'
                  : isSelected
                  ? 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
              `}
            >
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.hazard ? 'Potential hazard' : 'Safe condition'}
              </div>
              {isSelected && (
                <div className="text-xs mt-1 font-medium">
                  {isCorrectSelection && '✓ Correct'}
                  {isIncorrectSelection && '✗ Incorrect'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {completed && (
        <div 
          className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-green-600 dark:text-green-400 text-xl">🎯</div>
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                Excellent! You identified {correctCount} hazards correctly.
                {incorrectCount > 0 && ` (${incorrectCount} incorrect selections)`}
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs text-green-600 dark:text-green-400 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          <strong>Tip:</strong> Not everything is a hazard. Choose wisely — you need {threshold} correct hazard identifications.
        </p>
        <p>
          Wrong selections are allowed but don&apos;t count toward your goal. Focus on actual safety risks.
        </p>
      </div>
    </section>
  );
}
