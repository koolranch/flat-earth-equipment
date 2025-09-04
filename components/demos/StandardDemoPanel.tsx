'use client';
import { useEffect, useRef, useState } from 'react';
import { track, trackDemo } from '@/lib/analytics/track';

interface DemoPanelProps {
  moduleSlug: string;
  title: string;
  objective: string;
  estMin: number;
  children: React.ReactNode;
  onComplete?: () => void;
}

export default function DemoPanel({ 
  moduleSlug, 
  title, 
  objective, 
  estMin, 
  children, 
  onComplete 
}: DemoPanelProps) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedRef = useRef<number | null>(null);

  useEffect(() => {
    // Listen for child demo events via window CustomEvent
    function onChildEvent(e: any) {
      const d = e?.detail || {};
      
      if (d.type === 'sim_param_change') {
        track('sim_param_change', { 
          module: moduleSlug, 
          param_name: d.param_name,
          param_value: d.param_value,
          ...d 
        });
      }
      
      if (d.type === 'demo_complete') {
        finish();
      }
      
      if (d.type === 'demo_interaction') {
        track('demo_interaction', {
          module: moduleSlug,
          action: d.action,
          target: d.target,
          ...d
        });
      }
    }
    
    window.addEventListener('demo:child', onChildEvent as any);
    return () => window.removeEventListener('demo:child', onChildEvent as any);
  }, [moduleSlug]);

  function begin() {
    if (started) return;
    
    setStarted(true);
    setCompleted(false);
    startedRef.current = Date.now();
    
    // Track demo start
    trackDemo('start', moduleSlug, {
      title,
      objective,
      estimated_duration_min: estMin
    });
  }

  function finish() {
    if (!started || completed) return;
    
    setCompleted(true);
    const durationMs = startedRef.current ? Date.now() - startedRef.current : undefined;
    
    // Track demo completion
    trackDemo('complete', moduleSlug, {
      title,
      duration_ms: durationMs,
      duration_min: durationMs ? Math.round(durationMs / 60000 * 10) / 10 : undefined
    });
    
    // Set localStorage completion flag for quiz gating
    try {
      if (moduleSlug) {
        localStorage.setItem(`demo:${moduleSlug}:complete`, '1');
      }
    } catch {}
    
    // Emit completion event for other components
    try {
      window.dispatchEvent(new CustomEvent('demo_status', { 
        detail: { 
          module: moduleSlug, 
          completed: true 
        } 
      }));
    } catch {}
    
    // Call optional completion callback
    onComplete?.();
  }

  // Manual completion handler for "Mark Complete" buttons
  function markComplete() {
    finish();
  }

  return (
    <section 
      aria-label={`Interactive demo: ${title}`}
      className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700"
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 id={`demo-title-${moduleSlug}`} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p id={`demo-objective-${moduleSlug}`} className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {objective}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            ~{estMin} min
          </div>
          <button 
            onClick={begin} 
            disabled={started}
            aria-describedby={`demo-objective-${moduleSlug}`}
            className={`rounded-2xl px-4 py-2 text-sm shadow-lg text-white transition tappable ${
              started 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[var(--brand-orange)] hover:bg-orange-600'
            }`}
          >
            {started ? 'Running...' : 'Start Demo'}
          </button>
        </div>
      </header>
      
      {/* Demo content area */}
      <div className={`transition-opacity duration-300 ${started ? 'opacity-100' : 'opacity-50'}`}>
        {children}
      </div>
      
      {/* Completion controls */}
      {started && !completed && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Complete the demo steps above, then mark as finished.
            </p>
            <button 
              onClick={markComplete}
              className="rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm shadow-lg hover:bg-emerald-700 transition tappable"
              aria-label={`Mark ${title} demo as complete`}
            >
              Mark Complete
            </button>
          </div>
        </div>
      )}
      
      {/* Completion confirmation */}
      {completed && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-emerald-600 dark:text-emerald-400">✓</div>
            <div className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
              Demo complete!
            </div>
            {startedRef.current && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Completed in {Math.round((Date.now() - startedRef.current) / 1000)}s
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}