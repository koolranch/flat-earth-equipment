"use client";

import Link from "next/link";

export function ModuleFooterCTA(props: {
  nextHref: string; // or "" if last module
  enabled: boolean;
  isLast?: boolean;
}) {
  const { nextHref, enabled, isLast } = props;
  const label = isLast ? "Take Final Exam" : "Continue to Next Module";

  if (!nextHref) {
    return (
      <div className="mt-8 p-6 rounded-2xl border-2 bg-slate-50 border-slate-200">
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h3 className='font-bold text-lg mb-1'>Complete This Module</h3>
            <p className='text-sm text-slate-600'>Finish all tabs above to continue.</p>
          </div>
          <button 
            disabled
            className="px-6 py-3 rounded-xl font-semibold bg-slate-200 text-slate-400 cursor-not-allowed"
          >
            {label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-8 p-6 rounded-2xl border-2 transition-all ${
      enabled 
        ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-md' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          {enabled && (
            <div className='flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#F76511] to-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg'>
              ✓
            </div>
          )}
          <div>
            <h3 className='font-bold text-lg mb-1'>
              {enabled ? 'Module Complete!' : 'Complete This Module'}
            </h3>
            <p className='text-sm text-slate-600'>
              {enabled 
                ? isLast ? 'Ready for the final exam!' : 'Great job! Continue to the next module.'
                : 'Finish all tabs above to continue.'}
            </p>
          </div>
        </div>
        {enabled ? (
          <Link href={nextHref}>
            <button className="px-6 py-3 rounded-xl font-semibold bg-[#F76511] text-white hover:bg-orange-600 shadow-md hover:shadow-xl transition-all whitespace-nowrap">
              {label} →
            </button>
          </Link>
        ) : (
          <button 
            disabled
            className="px-6 py-3 rounded-xl font-semibold bg-slate-200 text-slate-400 cursor-not-allowed whitespace-nowrap"
          >
            Locked
          </button>
        )}
      </div>
    </div>
  );
}
