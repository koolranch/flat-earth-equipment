"use client";
import * as React from "react";
import { CheckChip } from "./CheckChip";

export type ChecklistItem = { id: string; label: string };

type ChecklistProps = {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium text-slate-800">
          Run the 8-point inspection{" "}
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {checkedIds.length}/{items.length}
          </span>
        </div>
        {/* right-side slot for your tab CTA */}
        <div className="hidden md:block">{ctaRight}</div>
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

      {/* On small screens, show CTA below grid too */}
      <div className="md:hidden pt-2">{ctaRight}</div>

      {/* subtle hint when incomplete */}
      {!allDone ? (
        <p className="text-xs text-slate-500">
          Tap each item to mark complete. All must be green to continue.
        </p>
      ) : (
        <p className="text-xs text-green-700">
          Nice — everything's green. You can continue.
        </p>
      )}
    </div>
  );
}
