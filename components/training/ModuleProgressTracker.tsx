import React from 'react';

export default function ModuleProgressTracker({ percent = 0 }: { percent?: number }) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  
  return (
    <div className="progress-wrap" aria-live="polite">
      <div 
        className="progress-bar" 
        role="progressbar" 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-valuenow={Math.round(clampedPercent)}
        aria-label={`Training progress: ${Math.round(clampedPercent)}% complete`}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${clampedPercent}%` }} 
        />
      </div>
      <span className="text-sm font-medium text-slate-800">
        {Math.round(clampedPercent)}%
      </span>
    </div>
  );
}
