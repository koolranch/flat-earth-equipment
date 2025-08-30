'use client';
import { useState, useMemo, useEffect } from 'react';

const ITEMS = [
  { key: 'tires', label: 'Tires', icon: '🛞', tip: 'Check for cuts, proper inflation, and wear' },
  { key: 'forks', label: 'Forks', icon: '🍴', tip: 'Inspect for cracks, wear, and proper alignment' },
  { key: 'chains', label: 'Chains', icon: '⛓️', tip: 'Check for kinks, proper tension, and lubrication' },
  { key: 'horn', label: 'Horn', icon: '📯', tip: 'Test horn function and audibility' },
  { key: 'lights', label: 'Lights', icon: '💡', tip: 'Verify all warning lights and headlights work' },
  { key: 'hydraulics', label: 'Hydraulics', icon: '🔧', tip: 'Check fluid levels and inspect for leaks' },
  { key: 'leaks', label: 'Leaks', icon: '💧', tip: 'Look for oil, hydraulic, or fuel leaks' },
  { key: 'dataplate', label: 'Data plate', icon: '📋', tip: 'Ensure data plate is legible and secure' }
];

export default function HotspotsEight() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [showTip, setShowTip] = useState<string | null>(null);
  
  const count = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
  const allComplete = count === ITEMS.length;
  const [hasCompleted, setHasCompleted] = useState(false);

  // Track completion state to prevent duplicate events
  useEffect(() => {
    if (allComplete && !hasCompleted) {
      setHasCompleted(true);
      window.dispatchEvent(new CustomEvent('demo:child', { 
        detail: { 
          type: 'demo_complete',
          total_items: ITEMS.length,
          completion_method: 'all_inspected'
        } 
      }));
    }
  }, [allComplete, hasCompleted]);

  function toggle(item: string) {
    setDone(prev => {
      const next = { ...prev, [item]: !prev[item] };
      const newCount = Object.values(next).filter(Boolean).length;
      
      // Emit analytics for each toggle
      window.dispatchEvent(new CustomEvent('demo:child', { 
        detail: { 
          type: 'sim_param_change', 
          item, 
          value: next[item],
          inspection_point: item,
          completed_count: newCount,
          total_count: ITEMS.length,
          progress_pct: Math.round((newCount / ITEMS.length) * 100)
        } 
      }));
      
      return next;
    });
  }

  function reset() {
    setDone({});
    setHasCompleted(false);
    setShowTip(null);
    
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'demo_interaction',
        action: 'reset',
        target: 'eight_point_inspection'
      } 
    }));
  }

  function handleKeyDown(event: React.KeyboardEvent, itemKey: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(itemKey);
    }
  }

  function showTooltip(itemKey: string) {
    setShowTip(itemKey);
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'demo_interaction',
        action: 'show_tip',
        target: itemKey
      } 
    }));
  }

  function hideTooltip() {
    setShowTip(null);
  }

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
          8-Point Daily Inspection
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {count}/{ITEMS.length} complete
          </span>
          {count > 0 && (
            <button
              onClick={reset}
              className="text-xs text-blue-600 dark:text-blue-400 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(count / ITEMS.length) * 100}%` }}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Tap each inspection point once. Order doesn&apos;t matter — just complete all 8 points.
      </div>

      {/* Inspection grid */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-4 gap-3" 
        role="group" 
        aria-label="Eight-point inspection checklist"
      >
        {ITEMS.map(item => {
          const isChecked = !!done[item.key];
          const showingTip = showTip === item.key;
          
          return (
            <div key={item.key} className="relative">
              <button
                onClick={() => toggle(item.key)}
                onKeyDown={(e) => handleKeyDown(e, item.key)}
                onMouseEnter={() => showTooltip(item.key)}
                onMouseLeave={hideTooltip}
                onFocus={() => showTooltip(item.key)}
                onBlur={hideTooltip}
                aria-pressed={isChecked}
                aria-describedby={showingTip ? `tip-${item.key}` : undefined}
                className={`
                  w-full rounded-xl border px-3 py-6 text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isChecked 
                    ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl" aria-hidden="true">
                    {isChecked ? '✅' : item.icon}
                  </div>
                  <div className="font-medium">{item.label}</div>
                  {isChecked && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      Checked
                    </div>
                  )}
                </div>
              </button>

              {/* Tooltip */}
              {showingTip && (
                <div
                  id={`tip-${item.key}`}
                  className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg max-w-48 text-center"
                  role="tooltip"
                >
                  {item.tip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {allComplete && (
        <div 
          className="p-4 bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="text-emerald-600 dark:text-emerald-400 text-xl">✓</div>
            <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              8-Point inspection complete! All systems checked and ready for operation.
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          <strong>Tip:</strong> Hover or focus on each item to see inspection details.
        </p>
        <p>
          Use Tab to navigate, Enter or Space to toggle completion.
        </p>
      </div>
    </div>
  );
}
