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
    <div
