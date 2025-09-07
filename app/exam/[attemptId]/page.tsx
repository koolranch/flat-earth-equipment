'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { track } from '@/lib/track';

type Question = { id: string; prompt: string; options: string[] };

export default function ExamRunner() {
  const { attemptId } = useParams() as { attemptId: string };
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ passed: boolean; score: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/exams/attempts/${attemptId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Load failed');
        setQuestions(json.questions);
      } catch (e: any) {
        setError(e.message);
      } finally { setLoading(false); }
    })();
  }, [attemptId]);

  async function submit() {
    try {
      setSubmitting(true); setError(null);
      const payload = Object.entries(answers).map(([question_id, choice_index]) => ({ question_id, choice_index }));
      const res = await fetch(`/api/exams/attempts/${attemptId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Submit failed');
      track('exam_submitted', { attemptId, score: json.result.score });
      setResult({ passed: json.result.passed, score: json.result.score });
    } catch (e: any) {
      setError(e.message);
    } finally { setSubmitting(false); }
  }

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10">Loading…</main>;
  if (error) return <main className="mx-auto max-w-3xl px-4 py-10 text-red-600">{error}</main>;
  if (result) return (
    <main className="mx-auto max-w-3xl px-4 py-10 grid gap-4">
      <h1 className="text-2xl font-semibold">Exam {result.passed ? 'Passed' : 'Failed'}</h1>
      <p className="text-slate-600">Score: {(result.score * 100).toFixed(0)}%</p>
      {result.passed ? (
        <div className="grid gap-2">
          <p className="text-green-700">Nice work. Your certificate will appear on your Records page.</p>
          <a href="/records" className="underline">Go to Records</a>
        </div>
      ) : (
        <button className="rounded bg-slate-900 text-white px-4 py-2" onClick={() => router.replace('/training/final')}>Try again</button>
      )}
    </main>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 grid gap-6">
      <h1 className="text-xl font-semibold">Final Exam</h1>
      <ol className="grid gap-6">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 font-medium">Q{i+1}. {q.prompt}</div>
            <div className="grid gap-2">
              {q.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    value={idx}
                    checked={answers[q.id] === idx}
                    onChange={() => { setAnswers(a => ({ ...a, [q.id]: idx })); track('exam_answered', { q: q.id, idx }); }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={submitting} className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit Exam'}</button>
        <span className="text-sm text-slate-500">Answered {Object.keys(answers).length} / {questions.length}</span>
      </div>
    </main>
  );
}
