'use client';
import { useEffect, useMemo, useState } from 'react';

type Row = { question_id: string; correct: boolean; selected_index: number | null; tags: string[]; difficulty: number; locale: string; question?: string; choices?: string[]; explain?: string; correct_index?: number };

export default function ExamReview() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const attempt = params.get('attempt') || '';
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      (window as any)?.analytics?.track?.('exam_review_opened', { attempt });
      try {
        const r = await fetch(`/api/exam/review?attempt=${attempt}`);
        const j = await r.json();
        if (j.ok) setRows(j.items || []);
      } finally { setLoading(false); }
    })();
  }, [attempt]);

  const wrong = useMemo(() => rows.filter(r => !r.correct), [rows]);

  if (loading) return <main className="container mx-auto p-4">Loading…</main>;
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Review incorrect</h1>
      {!wrong.length && <p>Nothing to review. Nice work.</p>}
      {wrong.map((r, idx) => (
        <article key={r.question_id} className="rounded-2xl border bg-white p-4 grid gap-2">
          <div className="text-sm text-slate-600">Item {idx + 1}</div>
          <div className="font-medium">{r.question}</div>
          <ul className="list-disc ml-5">
            {(r.choices || []).map((c, i) => (
              <li key={i} className={i === r.selected_index ? 'font-semibold text-red-700' : ''}>{c}</li>
            ))}
          </ul>
          {typeof r.selected_index === 'number' && r.choices && (
            <div className="text-sm">Your answer: <b>{r.choices[r.selected_index] ?? '—'}</b></div>
          )}
          <div className="text-sm text-green-700">Correct answer: <b>{(r.choices || [])[r.correct_index ?? 0] ?? ''}</b></div>
          {r.explain && <div className="text-sm text-slate-700">Why: {r.explain}</div>}
          <div className="flex flex-wrap gap-2 pt-2">
            {(r.tags || []).map(t => (
              <a key={t} href={`/training/study/${encodeURIComponent(t)}`} className="rounded-xl border px-3 py-1 text-sm" onClick={() => (window as any)?.analytics?.track?.('study_launch', { tag: t })}>Study: {t}</a>
            ))}
          </div>
        </article>
      ))}
    </main>
  );
}

// module anchor mapping no longer needed; Study uses tag routing.
