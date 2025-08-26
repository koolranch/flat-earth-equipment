// components/DemoPanel.tsx
"use client";
import React from "react";
import { analytics } from "@/lib/analytics";
import { useT } from "@/lib/i18n";

type DemoPanelProps = {
  title: string;
  objective: string;
  steps: string[];
  onStart?: () => void;
  onComplete?: (result?: unknown) => void;
  children: React.ReactNode;
};

export function DemoPanel({ title, objective, steps, onStart, onComplete, children }: DemoPanelProps) {
  const t = useT();
  
  const handleStart = () => {
    analytics.track("demo_start", { demo: title });
    onStart?.();
  };

  const handleComplete = (result?: unknown) => {
    analytics.track("demo_complete", { demo: title, result });
    onComplete?.(result);
  };

  return (
    <section className="rounded-2xl shadow-lg border border-slate-200 p-4">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
        <p className="text-sm text-slate-600">{objective}</p>
      </header>
      <ol className="list-decimal ml-5 mb-3 text-sm text-slate-700">
        {steps.map((s,i)=>(<li key={i}>{s}</li>))}
      </ol>
      <div role="region" aria-label={`${title} ${t('demo.interactive_label', 'interactive')}`} className="mb-3">
        {children}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-2xl bg-[#F76511] text-white px-4 py-2 focus:ring-2 focus:ring-[#F76511]"
          onClick={handleStart}
        >
          {t('demo.start', 'Start')}
        </button>
        <button
          className="rounded-2xl border px-4 py-2 focus:ring-2 focus:ring-[#F76511]"
          onClick={()=>handleComplete()}
        >
          {t('demo.continue', 'Continue')}
        </button>
      </div>
    </section>
  );
}
