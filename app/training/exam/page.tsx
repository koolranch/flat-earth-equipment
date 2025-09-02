'use client';
import { useEffect, useState } from 'react';
import { generateExam, submitExam } from '@/lib/quiz/client';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { ExamPaper, ExamSubmitResult } from '@/lib/quiz/types';

export default function ExamPage(){
  const { t, locale } = useI18n();
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ExamSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(()=>{ (async()=>{ 
    const p = await generateExam(locale); 
    setPaper(p); 
    setSessionId(p.session_id || null);
    const count = p.meta?.count || p.items.length;
    setAnswers(Array(count).fill(-1)); 
    (window as any).analytics?.track?.('exam_start', { count, locale }); 
  })(); }, [locale]);

  if (!paper) return <main className="container mx-auto p-4">{t('common.loading')}</main>;
  
  if (result){
    const incorrect = result.incorrectIndices as number[];
    
    return (
      <main className="container mx-auto p-4 space-y-3">
        <h1 className="text-2xl font-bold">{t('exam.results_title')}</h1>
        <div className="rounded-2xl border p-3">
          <div className="text-lg font-semibold">{result.passed ? t('exam.passed_title') : t('exam.failed_title')}</div>
          <div className="text-sm text-slate-700">{t('exam.score_label')}: {result.scorePct}% ({result.correct}/{result.total})</div>
        </div>
        {incorrect.length>0 && (
          <details className="rounded-2xl border p-3">
            <summary className="cursor-pointer font-medium">{t('exam.review_incorrect')} ({incorrect.length})</summary>
            <ul className="list-disc pl-5 text-sm mt-2">
              {incorrect.map(idx => (
                <li key={idx}><span className="font-mono">Q{idx+1}</span>: {paper.items[idx].question}</li>
              ))}
            </ul>
          </details>
        )}
        <div className="flex gap-2">
          <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={()=>{ setPaper(null); setSessionId(null); setResult(null); setI(0); }}>{t('exam.retake_exam')}</button>
          <a className="rounded-2xl border px-4 py-2" href="/records">{t('exam.view_records')}</a>
        </div>
      </main>
    );
  }

  const item = paper.items[i];
  function pick(idx:number){
    const next = [...answers]; next[i] = idx; setAnswers(next);
    (window as any).analytics?.track?.('quiz_item_answered', { i, picked: idx, locale });
  }
  
  async function submit(){
    if (isSubmitting || !paper || !sessionId) return;
    setIsSubmitting(true);
    try {
      const r = await submitExam({ session_id: sessionId, answers });
      setResult(r);
      (window as any).analytics?.track?.(r.passed ? 'exam_passed' : 'exam_failed', { scorePct: r.scorePct, locale });
    } catch (error) {
      console.error('Exam submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold">{t('exam.title')}</h1>
      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <div className="text-sm text-slate-600 mb-2">Q{i+1} / {paper.meta?.count || paper.items.length}</div>
        <div className="text-base font-medium mb-2">{item.question}</div>
        <div className="grid gap-2">
          {item.choices.map((c,idx)=> (
            <button key={idx} className={`text-left border rounded-xl p-3 text-sm ${answers[i]===idx?'border-slate-900':''}`} onClick={()=> pick(idx)}>{c}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <button className="rounded-2xl border px-4 py-2" disabled={i===0} onClick={()=> setI(n=> Math.max(0, n-1))}>{t('common.back')}</button>
          {i < (paper.meta?.count || paper.items.length)-1 ? (
            <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={()=> setI(n=> Math.min((paper.meta?.count || paper.items.length)-1, n+1))}>{t('common.next')}</button>
          ) : (
            <button 
              className="rounded-2xl bg-[#F76511] text-white px-4 py-2" 
              onClick={submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
