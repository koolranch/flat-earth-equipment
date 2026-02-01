"use client";
import * as React from "react";
import { CheckChip } from "./CheckChip";

export type ChecklistItem = { 
  id: string; 
  label: string; 
  tip?: string;  // Optional educational reinforcement message
};

type ChecklistProps = {
  title: string;                      // module-specific practice title
  subtitle?: string;                  // optional subtitle for instruction
  moduleId: string | number;
  sectionKey: "practice";             // ready for reuse later if needed
  items: ChecklistItem[];
  initialCheckedIds?: string[];       // from server if available
  onAllDone?: () => void;             // enable CTA etc.
  onProgressChange?: (checkedIds: string[]) => void;
  persistUrl?: string;                // optional API endpoint
  ctaRight?: React.ReactNode;         // right-side action area (e.g., "Mark Practice done → Flash Cards")
  completionTitle?: string;           // custom completion message title
  completionMessage?: string;         // custom completion message body
};

export function Checklist({
  title,
  subtitle,
  moduleId,
  sectionKey,
  items,
  initialCheckedIds = [],
  onAllDone,
  onProgressChange,
  persistUrl = "/api/progress/section",
  ctaRight,
  completionTitle = "Practice Section Completed!",
  completionMessage = "Great job! Continue to Flash Cards to reinforce your learning."
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
  const [lastTip, setLastTip] = React.useState<string | null>(null);

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

  const toggle = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!checkedIds.includes(id)) {
      // Only show tip when checking (not unchecking)
      if (item?.tip) {
        setLastTip(item.tip);
      }
    }
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Check if any items have tips
  const hasTips = items.some(item => item.tip);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 mt-1">{subtitle || "Tap each item to mark complete"}</p>
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

      {/* Educational Tip - shows after checking an item */}
      {hasTips && lastTip && !allDone && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 animate-in fade-in duration-300">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{lastTip}</span>
        </div>
      )}

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
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">{completionTitle}</h3>
              <p className="text-sm text-emerald-700 mt-1">{completionMessage}</p>
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
