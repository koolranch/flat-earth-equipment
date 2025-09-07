'use client';
import React from 'react';
import { loadQuiz, type Quiz } from '@/lib/quiz/loadQuiz';
import { track } from '@/lib/track';

export default function SimpleQuizModal({ module, locale = 'en', onClose, onPassed }: { module: number; locale?: string; onClose?: () => void; onPassed?: (score: number) => void }) {
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    loadQuiz(module, locale).then(q => { setQuiz(q); setAnswers(new Array(q.questions.length).fill(-1)); setLoading(false); track('quiz_opened', { module }); }).catch(e => { setError(e.message); setLoading(false); });
  }, [module, locale]);

  if (loading) return <div className="fixed inset-0 bg-black/40 grid place-items-center"><div className="rounded-lg bg-white p-6">Loading quiz…</div></div>;
  if (error || !quiz) return <div className="fixed inset-0 bg-black/40 grid place-items-center"><div className="rounded-lg bg-white p-6">Failed to load quiz. <button className="ml-3 underline" onClick={onClose}>Close</button></div></div>;

  const q = quiz.questions[idx];
  const setChoice = (choice: number) => {
    const next = answers.slice();
    next[idx] = choice;
    setAnswers(next);
    track('quiz_item_answered', { module, question_id: q.id, choice });
  };

  const next = () => {
    if (idx < quiz.questions.length - 1) setIdx(idx + 1); else finish();
  };

  const finish = async () => {
    const correct = quiz.questions.reduce((acc, qq, i) => acc + (answers[i] === qq.answer ? 1 : 0), 0);
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.pass_score;
    track(passed ? 'quiz_passed' : 'quiz_failed', { module, score, pass_mark: quiz.pass_score });

    // Try to persist via API; fall back to localStorage
    try {
      await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module, kind: 'quiz', score, passed }) });
    } catch {}
    try {
      const key = 'training:progress:v1';
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      state[`module_${module}`] = { quiz: { score, passed, at: Date.now() } };
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}

    if (passed) onPassed?.(score);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quiz — Module {quiz.module}</h3>
          <button className="text-slate-600 hover:text-slate-900" onClick={onClose}>✕</button>
        </div>
        <div className="grid gap-4">
          <div className="font-medium">{q.prompt}</div>
          <div className="grid gap-2">
            {q.choices.map((c, i) => (
              <label key={i} className={`flex items-center gap-3 rounded border p-3 ${answers[idx] === i ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                <input type="radio" name={`q-${idx}`} checked={answers[idx] === i} onChange={() => setChoice(i)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-slate-500">Question {idx + 1} of {quiz.questions.length}</div>
            <button className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50" disabled={answers[idx] === -1} onClick={next}>{idx < quiz.questions.length - 1 ? 'Next' : 'Finish'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
