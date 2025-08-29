'use client';
import { useState } from 'react';
import { useDemoAnalytics } from '@/lib/analytics/useDemoAnalytics';
import LiveRegion from '@/components/a11y/LiveRegion';
import { useT } from '@/lib/i18n';

export default function DemoPanel({
  demoId,
  moduleSlug,
  title,
  objectives,
  children,
  successText = 'Nice work — demo complete.',
  onComplete
}: {
  demoId: string;
  moduleSlug?: string;
  title: string;
  objectives?: string[];
  children: React.ReactNode;
  successText?: string;
  onComplete?: () => void;
}) {
  const { fire } = useDemoAnalytics(demoId, moduleSlug);
  const [done, setDone] = useState(false);
  const t = useT();

  function markComplete() {
    setDone(true);
    fire('demo_complete', { done: true });
    // best-effort autosave
    try {
      fetch('/api/demo-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'demo', slug: moduleSlug, demoId, status: 'complete' }) });
    } catch {}
    onComplete?.();
  }

  return (
    <section aria-labelledby={`h-${demoId}`}>
      <header className="mb-2">
        <h3 id={`h-${demoId}`} className="text-lg font-semibold text-[#0F172A] dark:text-white">{title}</h3>
        {objectives?.length ? (
          <ul className="mt-1 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
            {objectives.map((o,i)=>(<li key={i}>{o}</li>))}
          </ul>
        ) : null}
      </header>

      <LiveRegion message={done ? successText : ''} />

      <div className="mt-2">{children}</div>

      <div className="mt-3 flex gap-2">
        <button onClick={()=>fire('demo_start')} className="rounded-2xl border px-3 py-2 text-sm">{t('demo.restart')}</button>
        <button onClick={markComplete} className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm shadow-lg">{t('demo.complete')}</button>
      </div>
    </section>
  );
}
