'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { useT } from '@/lib/i18n';

function calcState(load: number, center: number, tiltDeg: number) {
  // Simplified heuristic: farther center & positive tilt push CG forward.
  // Return 'stable' | 'risk' | 'warn'
  const tiltFactor = 1 + (tiltDeg / 10); // crude heuristic
  const forward = center * tiltFactor;
  if (forward < 20) return 'stable';
  if (forward < 28) return 'risk';
  return 'warn';
}

export default function StabilityTriangle() {
  const t = useT();
  const [load, setLoad] = useState(2000);
  const [center, setCenter] = useState(24);
  const [tilt, setTilt] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const state = useMemo(() => calcState(load, center, tilt), [load, center, tilt]);

  // Track sim start on first interaction
  useEffect(() => {
    if (!hasStarted) {
      analytics.track('sim_start', { sim: 'stability' });
      setHasStarted(true);
    }
  }, [hasStarted]);

  // Track warnings
  useEffect(() => {
    if (state === 'warn') {
      analytics.track('sim_warning', { 
        sim: 'stability', 
        load, 
        center, 
        tilt,
        state 
      });
    }
  }, [state, load, center, tilt]);

  const handleLoadChange = (value: number) => {
    setLoad(value);
    analytics.track('sim_param_change', { 
      sim: 'stability', 
      param: 'load',
      value,
      state
    });
  };

  const handleCenterChange = (value: number) => {
    setCenter(value);
    analytics.track('sim_param_change', { 
      sim: 'stability', 
      param: 'center',
      value,
      state
    });
  };

  const handleTiltChange = (value: number) => {
    setTilt(value);
    analytics.track('sim_param_change', { 
      sim: 'stability', 
      param: 'tilt',
      value,
      state
    });
  };

  // Calculate CG dot position
  const cgPosition = useMemo(() => {
    // Base position from center of gravity
    const baseX = 50 + ((center - 24) * 1.5); // Scale center distance
    const baseY = 60; // Base Y position
    
    // Adjust for tilt (positive tilt moves forward/down)
    const tiltX = tilt * 2; // Tilt effect on X
    const tiltY = Math.abs(tilt) * 0.5; // Tilt effect on Y
    
    // Clamp to triangle bounds
    const x = Math.max(15, Math.min(85, baseX + tiltX));
    const y = Math.max(15, Math.min(85, baseY + tiltY));
    
    return { x, y };
  }, [center, tilt]);

  const getStateMessage = () => {
    switch (state) {
      case 'warn':
        return t('stability.tip_warning', 'Tip warning — reduce tilt or bring load center closer.');
      case 'risk':
        return t('stability.at_risk', 'At risk — adjust load center/tilt.');
      default:
        return t('stability.stable', 'Stable.');
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'warn': return 'bg-red-600';
      case 'risk': return 'bg-amber-500';
      default: return 'bg-emerald-600';
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 p-4 shadow-lg bg-white">
      <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
        {t('stability.title', 'Stability Triangle Simulation')}
      </h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label 
            htmlFor="load-slider"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('stability.load_weight', 'Load Weight')}: {load} {t('stability.lb', 'lb')}
          </label>
          <input
            id="load-slider"
            aria-label={`${t('stability.load_weight', 'Load Weight')} ${load} ${t('stability.lb', 'lb')}`}
            type="range"
            min={0}
            max={4000}
            step={50}
            value={load}
            onChange={(e) => handleLoadChange(+e.target.value)}
            className="
              w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F76511] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-[#F76511] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0
            "
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span>
            <span>4000</span>
          </div>
        </div>

        <div>
          <label 
            htmlFor="center-slider"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('stability.load_center', 'Load Center')}: {center} {t('stability.in', 'in')}
          </label>
          <input
            id="center-slider"
            aria-label={`${t('stability.load_center', 'Load Center')} ${center} ${t('stability.in', 'in')}`}
            type="range"
            min={12}
            max={36}
            step={1}
            value={center}
            onChange={(e) => handleCenterChange(+e.target.value)}
            className="
              w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F76511] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-[#F76511] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0
            "
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>12</span>
            <span>36</span>
          </div>
        </div>

        <div>
          <label 
            htmlFor="tilt-slider"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('stability.mast_tilt', 'Mast Tilt')}: {tilt}°
          </label>
          <input
            id="tilt-slider"
            aria-label={`${t('stability.mast_tilt', 'Mast Tilt')} ${tilt} ${t('stability.degrees', 'degrees')}`}
            type="range"
            min={-5}
            max={10}
            step={0.5}
            value={tilt}
            onChange={(e) => handleTiltChange(+e.target.value)}
            className="
              w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-opacity-50
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F76511] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-[#F76511] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0
            "
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>-5°</span>
            <span>10°</span>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mt-4 aspect-[16/9] bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex items-center justify-center p-4">
        <div className="relative w-full max-w-md aspect-[4/3] bg-white rounded-lg border-2 border-slate-200 shadow-inner">
          {/* Triangle SVG */}
          <svg 
            viewBox="0 0 100 80" 
            className="absolute inset-0 w-full h-full"
            aria-label={t('stability.triangle_diagram', 'Stability triangle diagram')}
          >
            {/* Base triangle */}
            <polygon 
              points="15,70 50,15 85,70" 
              fill="rgba(148, 163, 184, 0.1)" 
              stroke="#94a3b8" 
              strokeWidth="1"
            />
            
            {/* Grid lines for reference */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="80" fill="url(#grid)" opacity="0.3"/>
            
            {/* Center line */}
            <line x1="50" y1="15" x2="50" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2"/>
            
            {/* Labels */}
            <text x="50" y="10" textAnchor="middle" className="fill-slate-600 text-xs">
              {t('stability.front', 'Front')}
            </text>
            <text x="12" y="75" textAnchor="middle" className="fill-slate-600 text-xs">
              {t('stability.left', 'L')}
            </text>
            <text x="88" y="75" textAnchor="middle" className="fill-slate-600 text-xs">
              {t('stability.right', 'R')}
            </text>
          </svg>
          
          {/* Center of Gravity Dot */}
          <div
            className={`
              absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300
              ${getStateColor()}
            `}
            style={{ 
              left: `${cgPosition.x}%`, 
              top: `${cgPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            title={`${t('stability.center_of_gravity', 'Center of Gravity')}: ${getStateMessage()}`}
            aria-label={`${t('stability.center_of_gravity', 'Center of Gravity')}: ${getStateMessage()}`}
          />
        </div>
      </div>

      {/* Status Display */}
      <div className="mt-4 p-3 rounded-lg bg-slate-50">
        <div 
          className="text-sm font-medium flex items-center gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className={`w-3 h-3 rounded-full ${getStateColor()}`}></div>
          <span className={`
            ${state === 'warn' ? 'text-red-700' : ''}
            ${state === 'risk' ? 'text-amber-700' : ''}
            ${state === 'stable' ? 'text-emerald-700' : ''}
          `}>
            {getStateMessage()}
          </span>
        </div>
        
        {/* Additional guidance */}
        {state !== 'stable' && (
          <div className="mt-2 text-xs text-slate-600">
            <p className="font-medium mb-1">{t('stability.safety_tips', 'Safety Tips')}:</p>
            <ul className="list-disc list-inside space-y-1">
              {state === 'warn' && (
                <>
                  <li>{t('stability.tip_reduce_tilt', 'Reduce forward mast tilt')}</li>
                  <li>{t('stability.tip_center_load', 'Keep load center closer to mast')}</li>
                  <li>{t('stability.tip_reduce_weight', 'Consider reducing load weight')}</li>
                </>
              )}
              {state === 'risk' && (
                <>
                  <li>{t('stability.tip_careful_operation', 'Operate with extra caution')}</li>
                  <li>{t('stability.tip_avoid_turns', 'Avoid sharp turns or sudden movements')}</li>
                  <li>{t('stability.tip_level_surface', 'Ensure operating on level surface')}</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-slate-500">
        <p className="font-medium mb-1">{t('stability.legend', 'Legend')}:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
            <span>{t('stability.stable', 'Stable')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span>{t('stability.at_risk', 'At Risk')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
            <span>{t('stability.tip_warning', 'Tip Warning')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
