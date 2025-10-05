"use client";
import * as React from "react";
import { CheckChip } from "./CheckChip";

export type ChecklistItem = { id: string; label: string };

type ChecklistProps = {
  title: string;                      // module-specific practice title
  moduleId: string | number;
  sectionKey: "practice";             // ready for reuse later if needed
  items: ChecklistItem[];
  initialCheckedIds?: string[];       // from server if available
  onAllDone?: () => void;             // enable CTA etc.
  onProgressChange?: (checkedIds: string[]) => void;
  persistUrl?: string;                // optional API endpoint
  ctaRight?: React.ReactNode;         // right-side action area (e.g., "Mark Practice done → Flash Cards")
};

export function Checklist({
  title,
  moduleId,
  sectionKey,
  items,
  initialCheckedIds = [],
  onAllDone,
  onProgressChange,
  persistUrl = "/api/progress/section",
  ctaRight
}: ChecklistProps) {
  // hydrate from localStorage if present
  const storageKey = `feq:${moduleId}:${sectionKey}`;
  const [checkedIds, setCheckedIds] = React.useState<string[]>(() => {
    try {
      const fromStore = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(fromStore) && fromStore.length) return fromStore;
    } catch {}
    return initialCheckedIds;
  });

  const allDone = checkedIds.length === items.length;

  React.useEffect(() => {
    onProgressChange?.(checkedIds);
    // local fallback
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedIds));
    } catch {}
    // best-effort server persist
    (async () => {
      try {
        await fetch(persistUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            section: sectionKey,
            checkedIds
          })
        });
      } catch {
        // ignore; we still keep local progress
      }
    })();
    if (allDone) onAllDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedIds]);

  const toggle = (id: string) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 mt-1">Tap each item to mark complete</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#F76511]">{checkedIds.length}</div>
          <div className="text-xs text-slate-600">of {items.length} complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#F76511] to-orange-600 transition-all duration-500"
          style={{ width: `${(checkedIds.length / items.length) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((it, idx) => (
          <CheckChip
            key={it.id}
            label={it.label}
            checked={checkedIds.includes(it.id)}
            onToggle={() => toggle(it.id)}
            testId={`chip-${idx}`}
          />
        ))}
      </div>

      {/* Completion Banner */}
      {allDone && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">Practice Section Completed!</h3>
              <p className="text-sm text-emerald-700">Great job! Continue to Flash Cards to reinforce your learning.</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA slot */}
      {ctaRight && (
        <div className="flex justify-end">{ctaRight}</div>
      )}
    </div>
  );
}
