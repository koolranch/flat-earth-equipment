'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Simplified model: triangle points (A,B,C) approximating support polygon.
 * We'll plot a dot (cx, cy) from a toy combination of params.
 * Units are arbitrary; goal is conceptual learning, not physics accuracy.
 */
export default function StabilityLite() {
  const [w, setW] = useState(1500); // load weight (lb)
  const [d, setD] = useState(18);   // load distance from faceplate (in)
  const [t, setT] = useState(0);    // mast tilt (deg back is positive)
  const [stable, setStable] = useState(false);
  const [completed, setCompleted] = useState(false);
  const stableSince = useRef<number | null>(null);

  // Emit analytics on param change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'sim_param_change', 
        param: 'load_weight', 
        value: w,
        load_distance: d,
        mast_tilt: t,
        stable: stable
      } 
    }));
  }, [w, d, t, stable]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'sim_param_change', 
        param: 'load_distance', 
        value: d,
        load_weight: w,
        mast_tilt: t,
        stable: stable
      } 
    }));
  }, [d, w, t, stable]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('demo:child', { 
      detail: { 
        type: 'sim_param_change', 
        param: 'mast_tilt', 
        value: t,
        load_weight: w,
        load_distance: d,
        stable: stable
      } 
    }));
  }, [t, w, d, stable]);

  // Triangle points (normalized SVG viewport 0..100)
  const A = { x: 10, y: 90 }; // left front wheel
  const B = { x: 90, y: 90 }; // right front wheel
  const C = { x: 50, y: 10 }; // rear axle pivot

  // Derived COG (toy function): bias forward with weight & distance; tilt shifts upward/back slightly
  const cog = useMemo(() => {
    const forwardBias = Math.min(40, (w / 2000) * 20 + (d / 24) * 20); // 0..40
    const tiltBias = Math.max(-10, Math.min(10, t / 3)); // -10..10
    const baseX = 50 + (forwardBias - 20); // center 50, forward shifts right
    const baseY = 50 - tiltBias;           // tilt back lowers Y a bit
    return { 
      x: Math.max(10, Math.min(90, baseX)), 
      y: Math.max(10, Math.min(90, baseY)) 
    };
  }, [w, d, t]);

  // Point-in-triangle test (barycentric)
  function insideTriangle(p: { x: number; y: number }) {
    const { x, y } = p;
    const v0 = { x: C.x - A.x, y: C.y - A.y };
    const v1 = { x: B.x - A.x, y: B.y - A.y };
    const v2 = { x: x - A.x, y: y - A.y };
    
    const dot = (u: any, v: any) => u.x * v.x + u.y * v.y;
    const d00 = dot(v0, v0), d01 = dot(v0, v1), d11 = dot(v1, v1), d20 = dot(v2, v0), d21 = dot(v2, v1);
    const denom = d00 * d11 - d01 * d01;
    
    if (denom === 0) return false;
    
    const a = (d11 * d20 - d01 * d21) / denom;
    const b = (d00 * d21 - d01 * d20) / denom;
    const c = 1 - a - b;
    
    return a >= 0 && b >= 0 && c >= 0;
  }

  // Stability timing
  useEffect(() => {
    const ok = insideTriangle(cog);
    setStable(ok);
    const now = Date.now();
    
    if (ok) {
      if (stableSince.current == null) {
        stableSince.current = now;
      }
      if (now - (stableSince.current || now) > 3000 && !completed) {
        setCompleted(true);
        window.dispatchEvent(new CustomEvent('demo:child', { 
          detail: { 
            type: 'demo_complete',
            final_weight: w,
            final_distance: d,
            final_tilt: t,
            stable_duration: 3000,
            completion_method: 'stability_maintained'
          } 
        }));
      }
    } else {
      stableSince.current = null;
    }
  }, [cog.x, cog.y, completed, w, d, t]);

  // Calculate time remaining for stability
  const [timeInStable, setTimeInStable] = useState(0);
  useEffect(() => {
    if (stable && stableSince.current && !completed) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - (stableSince.current || Date.now());
        setTimeInStable(Math.min(3000, elapsed));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeInStable(0);
    }
  }, [stable, completed]);

  const progressPct = stable ? (timeInStable / 3000) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      
      {/* Stability Triangle Visualization */}
      <div className="rounded-xl border p-3 bg-white dark:bg-slate-900">
        <h3 className="text-sm font-medium mb-2">Stability Triangle</h3>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-auto border rounded" 
          aria-label="Stability triangle visualization"
        >
          {/* Triangle representing stability zone */}
          <polygon 
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} 
            fill="#F1F5F9" 
            stroke="#0F172A" 
            strokeWidth="1" 
          />
          
          {/* Wheel positions */}
          <circle cx={A.x} cy={A.y} r="2" fill="#64748B" />
          <circle cx={B.x} cy={B.y} r="2" fill="#64748B" />
          <circle cx={C.x} cy={C.y} r="2" fill="#64748B" />
          
          {/* COG dot */}
          <circle 
            cx={cog.x} 
            cy={cog.y} 
            r="3" 
            fill={stable ? '#059669' : '#DC2626'}
            stroke="#FFFFFF"
            strokeWidth="1"
          >
            <title>{stable ? 'Stable' : 'Unstable'}</title>
          </circle>
          
          {/* Labels */}
          <text x={A.x} y={A.y - 5} textAnchor="middle" fontSize="6" fill="currentColor">L</text>
          <text x={B.x} y={B.y - 5} textAnchor="middle" fontSize="6" fill="currentColor">R</text>
          <text x={C.x} y={C.y + 8} textAnchor="middle" fontSize="6" fill="currentColor">Rear</text>
        </svg>
        
        <div className={`mt-2 text-sm font-medium ${stable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {stable ? 'Stable' : 'Unstable — adjust controls'}
        </div>
        
        {/* Stability timer */}
        {stable && !completed && (
          <div className="mt-2">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              Hold stable for 3 seconds: {Math.ceil((3000 - timeInStable) / 1000)}s remaining
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div 
                className="bg-green-600 h-1 rounded-full transition-all duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Completion message */}
        {completed && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded text-sm text-green-800 dark:text-green-200">
            ✓ Demo complete! You maintained stability for 3 seconds.
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="rounded-xl border p-3 space-y-3 bg-white dark:bg-slate-900" role="group" aria-label="Stability controls">
        <h3 className="text-sm font-medium">Controls</h3>
        
        <div>
          <label htmlFor="w" className="block text-sm font-medium mb-1">
            Load weight (lb): {w.toLocaleString()}
          </label>
          <input 
            id="w" 
            type="range" 
            min={0} 
            max={4000} 
            step={100} 
            value={w} 
            onChange={e => setW(Number(e.target.value))} 
            className="w-full"
            aria-describedby="w-help"
          />
          <div id="w-help" className="text-xs text-slate-500 mt-1">
            Heavier loads affect center of gravity
          </div>
        </div>
        
        <div>
          <label htmlFor="d" className="block text-sm font-medium mb-1">
            Load distance (in): {d}
          </label>
          <input 
            id="d" 
            type="range" 
            min={0} 
            max={48} 
            step={1} 
            value={d} 
            onChange={e => setD(Number(e.target.value))} 
            className="w-full"
            aria-describedby="d-help"
          />
          <div id="d-help" className="text-xs text-slate-500 mt-1">
            Distance from fork face to load center
          </div>
        </div>
        
        <div>
          <label htmlFor="t" className="block text-sm font-medium mb-1">
            Mast tilt (°): {t > 0 ? '+' : ''}{t}
          </label>
          <input 
            id="t" 
            type="range" 
            min={-10} 
            max={10} 
            step={1} 
            value={t} 
            onChange={e => setT(Number(e.target.value))} 
            className="w-full"
            aria-describedby="t-help"
          />
          <div id="t-help" className="text-xs text-slate-500 mt-1">
            Positive = back tilt, Negative = forward tilt
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500">
            <strong>Goal:</strong> Keep the red/green dot inside the triangle for 3 seconds to complete.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Adjust controls to see how they affect the center of gravity position.
          </p>
        </div>
      </div>
    </div>
  );
}
