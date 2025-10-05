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

    // Save quiz completion to database via new API
    try {
      console.log('🔄 Saving quiz completion for module:', module, { score, passed });
      const response = await fetch('/api/training/quiz-complete', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ moduleId: module, score, passed }) 
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz completion saved to database:', result);
      } else {
        const errorText = await response.text();
        console.error('⚠️ Failed to save quiz completion:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error saving quiz completion:', error);
    }
    try {
      const key = 'training:progress:v1';
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      state[`module_${module}`] = { quiz: { score, passed, at: Date.now() } };
      localStorage.setItem(key, JSON.stringify(state));
      
      // Dispatch custom event to update progress bar immediately
      window.dispatchEvent(new CustomEvent('module_complete', { 
        detail: { module, score, passed } 
      }));
    } catch {}

    if (passed) onPassed?.(score);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Orange Progress Bar */}
        <div className="h-2 bg-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-[#F76511] to-orange-600 transition-all duration-300"
            style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F76511] to-orange-600 text-white flex items-center justify-center font-bold text-lg">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Quiz — Module {quiz.module}</h3>
                <p className="text-sm text-slate-600">Question {idx + 1} of {quiz.questions.length}</p>
              </div>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-900 transition-colors text-2xl w-8 h-8 flex items-center justify-center" 
              onClick={onClose}
              aria-label="Close quiz"
            >
              ✕
            </button>
          </div>

          {/* Question */}
          <div className="mb-6">
            <p className="text-lg font-medium text-slate-900 leading-relaxed">{q.prompt}</p>
          </div>

          {/* Choices */}
          <div className="grid gap-3 mb-6">
            {q.choices.map((c, i) => (
              <label 
                key={i} 
                className={`
                  relative flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all
                  ${answers[idx] === i 
                    ? 'border-[#F76511] bg-orange-50 shadow-md' 
                    : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }
                `}
              >
                <input 
                  type="radio" 
                  name={`q-${idx}`} 
                  checked={answers[idx] === i} 
                  onChange={() => setChoice(i)}
                  className="w-5 h-5 text-[#F76511] focus:ring-[#F76511] focus:ring-2"
                />
                <span className="text-slate-800 flex-1">{c}</span>
                {answers[idx] === i && (
                  <div className="w-6 h-6 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: quiz.questions.length }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-2 rounded-full transition-all ${
                      i < idx ? 'bg-emerald-500' : 
                      i === idx ? 'bg-[#F76511] w-8' : 
                      'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button 
              className="rounded-xl bg-gradient-to-r from-[#F76511] to-orange-600 text-white px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              disabled={answers[idx] === -1} 
              onClick={next}
            >
              {idx < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
