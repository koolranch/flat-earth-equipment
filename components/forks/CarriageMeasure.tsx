'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarriageMeasureProps {
  onClassSelect: (itaClass: string) => void;
}

export default function CarriageMeasure({ onClassSelect }: CarriageMeasureProps) {
  const [measurement, setMeasurement] = useState<string>('');
  const [detectedClass, setDetectedClass] = useState<string | null>(null);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeasurement(val);
    
    const inches = parseFloat(val);
    if (isNaN(inches)) {
      setDetectedClass(null);
      return;
    }

    // Logic based on ITA standards (approximate ranges)
    if (inches >= 15 && inches <= 17) {
      setDetectedClass('Class II');
    } else if (inches >= 19 && inches <= 21) {
      setDetectedClass('Class III');
    } else if (inches >= 24 && inches <= 26) {
      setDetectedClass('Class IV');
    } else {
      setDetectedClass(null);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-6 max-w-md mx-auto shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Measure Your Carriage
      </h3>
      
      <div className="flex gap-6 mb-6">
        {/* Visual Guide Area - In a real app, this would be an SVG/Image */}
        <div className="w-1/3 bg-slate-100 rounded-lg flex items-center justify-center relative h-48 border border-slate-300">
           <div className="absolute left-2 top-4 bottom-4 border-l-2 border-dashed border-slate-400 w-4"></div>
           <div className="text-xs text-slate-500 absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
             Measure Top to Bottom
           </div>
           <div className="w-12 h-32 bg-slate-300 rounded border border-slate-400"></div>
        </div>

        <div className="w-2/3 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Height (Inches)
            </label>
            <input 
              type="number" 
              placeholder="e.g. 16"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-canyon-rust focus:border-canyon-rust"
              value={measurement}
              onChange={handleMeasurementChange}
            />
            <p className="text-xs text-slate-500 mt-1">
              Measure from the top edge of the top bar to the bottom edge of the bottom bar.
            </p>
          </div>

          {detectedClass ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm text-green-800 font-medium">Match Found!</p>
              <p className="text-lg font-bold text-green-900">{detectedClass}</p>
              <button
                onClick={() => onClassSelect(detectedClass)}
                className="mt-2 w-full bg-green-600 text-white text-sm font-semibold py-2 rounded hover:bg-green-700 transition-colors"
              >
                Shop {detectedClass} Forks
              </button>
            </div>
          ) : measurement && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No standard class match. Common heights: 16" (Class II), 20" (Class III), 25" (Class IV).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
