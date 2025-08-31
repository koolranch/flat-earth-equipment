'use client';
import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics/track';

export default function FinalExamRunner() {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null); // {exam_id, pass_pct, items, selected_ids}
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{passed: boolean; score_pct: number; incorrect: any[]} | null>(null);

  useEffect(() => { 
    (async () => {
      setLoading(true);
      const res = await fetch('/api/exam/final', { cache: 'no-store' });
      const j = await res.json();
      setMeta(j);
      setLoading(false);
      track('exam_started', { exam: 'final' });
    })(); 
  }, []);

  const item = useMemo(() => meta?.items?.[idx] || null, [meta, idx]);

  function answerAndNext(qid: string, optionId: string) {
    setAnswers(a => ({ ...a, [qid]: optionId }));
    track('exam_item_answered', { exam: 'final', question_id: qid, option_id: optionId });
    setIdx(i => Math.min(i + 1, (meta?.items?.length || 1) - 1));
  }

  async function submit() {
    const payload = { locale: meta?.locale || 'en', selected_ids: meta?.selected_ids || [], answers };
    const res = await fetch('/api/exam/final/submit', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    const j = await res.json();
    setDone(true); 
    setResult(j);
    track(j.passed ? 'exam_passed' : 'exam_failed', { exam: 'final', score_pct: j.score_pct });
  }

  if (loading) return <div className="text-sm text-slate-600">Loading exam…</div>;
  if (!meta?.items?.length) return <div className="text-sm text-slate-600">Exam unavailable.</div>;

  if (done && result) {
    return (
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900">
        <h1 className="text-xl font-bold">Final Exam — Results</h1>
        <p className="mt-1 text-sm">Score: {result.score_pct}% — {result.passed ? 'Passed' : 'Not passed'}</p>
        {!result.passed && result.incorrect?.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm underline">Review incorrect</summary>
            <ul className="mt-2 space-y-2">
              {result.incorrect.map((r: any) => (
                <li key={r.id} className="rounded-xl border p-2">
                  <div className="text-sm">Question: {r.id}</div>
                  <div className="text-xs text-slate-600">Correct: {r.correct}</div>
                  {r.explain && <div className="text-xs text-slate-500">{r.explain}</div>}
                </li>
              ))}
            </ul>
          </details>
        )}
        {result.passed && <div className="mt-3 text-emerald-700 text-sm">If your site issues certificates automatically, check your <a className="underline" href="/records">Records</a>.</div>}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900">
      <header className="mb-3">
        <h1 className="text-xl font-bold">Final Exam</h1>
        <p className="text-sm text-slate-600">{(idx + 1)} / {meta.items.length} — Pass ≥ {meta.pass_pct}%</p>
      </header>
      <div className="space-y-3">
        <div className="text-base font-medium">{item.prompt}</div>
        <ul role="group" className="grid gap-2">
          {item.options.map((o: any) => (
            <li key={o.id}>
              <button 
                onClick={() => answerAndNext(item.id, o.id)} 
                className="w-full text-left rounded-xl border px-3 py-2 text-sm hover:border-orange-600 hover:bg-gray-50 transition-colors"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between mt-2">
          <button 
            disabled={idx === 0} 
            onClick={() => setIdx(i => Math.max(0, i - 1))} 
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {idx === meta.items.length - 1 ? (
            <button 
              onClick={submit} 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm hover:bg-orange-700 transition-colors"
            >
              Submit
            </button>
          ) : (
            <button 
              onClick={() => setIdx(i => Math.min(meta.items.length - 1, i + 1))} 
              className="rounded-xl border px-3 py-2 text-sm hover:border-orange-600 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
