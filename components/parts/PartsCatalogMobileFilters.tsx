'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

type Props = {
  label: string;
  activeCount: number;
  children: ReactNode;
};

/**
 * Mobile-only trigger + slide-over drawer wrapping the server-rendered
 * filter sidebar. Filters are plain links, so we close the drawer as soon
 * as one is clicked and let navigation update the page.
 */
export default function PartsCatalogMobileFilters({ label, activeCount, children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const onPanelClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) {
      setOpen(false);
    }
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#F76511]"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F76511] text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-base font-bold text-slate-900">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4" onClick={onPanelClick}>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
