import { Info } from 'lucide-react';
import { useState } from 'react';

export default function RecommendationInfo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button type="button" aria-label="How recommendations work" onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900">
        <Info className="h-4 w-4" /> How we choose
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-80 rounded-xl border bg-white p-3 text-xs shadow-lg">
          <p className="mb-1 font-medium">Recommendation criteria</p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700">
            <li>Voltage match to your battery</li>
            <li>Charge speed fit (overnight or fast)</li>
            <li>Input power (single-phase / three-phase)</li>
            <li>Chemistry compatibility (lead-acid, AGM, gel, lithium)</li>
            <li>Quick-ship availability when possible</li>
          </ul>
          <p className="mt-2 text-neutral-500">If an exact match isn't available, we show the closest options.</p>
        </div>
      )}
    </div>
  );
}
