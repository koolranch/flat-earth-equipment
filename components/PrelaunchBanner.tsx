'use client';
import { useEffect, useState } from 'react';
import { PRELAUNCH_PREVIEW } from '@/lib/training/flags';

export default function PrelaunchBanner() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { setHidden(sessionStorage.getItem('prelaunch.dismissed') === '1'); }, []);
  if (!PRELAUNCH_PREVIEW || hidden) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 flex items-center justify-between gap-3">
      <div className="text-sm md:text-base text-slate-700">
        <strong className="text-slate-900">Pre-launch preview.</strong> Purchasing opens soon. You can explore the training interface today.
      </div>
      <button
        onClick={() => { sessionStorage.setItem('prelaunch.dismissed', '1'); setHidden(true); }}
        className="text-sm underline"
        aria-label="Dismiss banner"
      >Dismiss</button>
    </div>
  );
}
