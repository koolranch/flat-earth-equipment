'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';

async function api(path:string, init?:RequestInit){ const r = await fetch(path, { cache:'no-store', ...init }); if (!r.ok) throw new Error(path); return r.json(); }

export default function ExamPage(){
  const { t, locale } = useI18n();
  const [paper, setPaper] = useState<any>(null); // {id, session_id, items[], time_limit_sec, pass_score}
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const saveTick = useRef<number>(0);

  // Analytics for retake tips - must be at component top level
  const weak = (result?.weak_tags || []) as { tag:string; missed:number }[];
  useEffect(()=>{ if(result && weak.length){ (window as any)?.analytics?.track?.('exam_retake_tips_shown', { weak }); } }, [result, weak]);

  // Try to resume
  useEffect(()=>{(async()=>{
    try {
      const res = await api('/api/exam/resume');
      if (res.found){
        setPaper({ id: res.session.paper_id, session_id: res.session.id, items: res.session.items, time_limit_sec: res.session.remaining_sec, pass_score: undefined });
        setAnswers(res.session.answers || new Array(res.session.items.length).fill(-1));
        setRemaining(res.session.remaining_sec);
        (window as any)?.analytics?.track?.('exam_resumed', { locale });
      } else {
        const gen = await api('/api/exam/generate', { method:'POST', body: JSON.stringify({ locale }) });
        setPaper({ id: gen.id, session_id: gen.session_id, items: gen.items, time_limit_sec: gen.time_limit_sec, pass_score: gen.pass_score });
        setAnswers(new Array(gen.meta.count).fill(-1));
        setRemaining(gen.time_limit_sec);
        (window as any)?.analytics?.track?.('exam_start', { count: gen.meta.count, locale });
      }
    } catch(e){ console.error(e); }
    setLoading(false);
  })() }, [locale]);

  // Countdown
  useEffect(()=>{
    if (!paper || result) return;
    const h = window.setInterval(()=>{ setRemaining(r=> Math.max(0, r-1)); saveTick.current++; }, 1000);
    return ()=> window.clearInterval(h);
  }, [paper, result]);

  // Autosave every ~15s and on remaining change bursts
  useEffect(()=>{
    if (!paper || result) return;
    if (saveTick.current % 15 !== 0) return;
    (async()=>{ try { await api('/api/exam/save-progress', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ session_id: paper.session_id, answers, remaining_sec: remaining }) }); (window as any)?.analytics?.track?.('exam_autosave', { remaining }); } catch{} })();
  }, [remaining]);

  useEffect(()=>{ if (remaining===0 && paper && !result){
    (async()=>{ try { const r = await api('/api/exam/submit', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ session_id: paper.session_id, answers }) }); setResult(r); (window as any)?.analytics?.track?.('exam_timeout', { locale }); } catch(e){ console.error(e);} })();
  } }, [remaining, paper, result, answers, locale]);

  function pick(idx:number){ const next = [...answers]; next[i] = idx; setAnswers(next); (window as any)?.analytics?.track?.('quiz_item_answered', { i, picked: idx, locale }); }
  async function submit(){ const r = await api('/api/exam/submit', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ session_id: paper.session_id, answers }) }); setResult(r); (window as any)?.analytics?.track?.(r.passed? 'exam_passed':'exam_failed', { scorePct: r.scorePct, locale }); }

  if (loading) return <main className="container mx-auto p-4">{t('common.loading')}</main>;
  if (!paper) return <main className="container mx-auto p-4">No exam available.</main>;
  
  if (result){
    const incorrect = result.incorrectIndices as number[];
    const recs = (result.recommendations || []) as { tag:string; slug?:string|null; href?:string|null }[];
    return (
      <main className="container mx-auto p-4 space-y-3">
        <h1 className="text-2xl font-bold">{t('exam.results_title')}</h1>
        <div className="rounded-2xl border p-3">
          <div className="text-lg font-semibold">{result.passed ? t('exam.passed_title') : t('exam.failed_title')}</div>
          <div className="text-sm text-slate-700">{t('exam.score_label')}: {result.scorePct}% ({result.correct}/{result.total})</div>
        </div>
        {incorrect?.length>0 && (
          <details className="rounded-2xl border p-3"><summary className="font-medium cursor-pointer">{t('exam.review_incorrect')}</summary>
            <ul className="list-disc pl-5 mt-2 text-sm">{incorrect.map((k:number)=> (<li key={k}><span className="font-mono">Q{k+1}</span>: {paper.items[k]?.question}</li>))}</ul>
          </details>
        )}
        {!!weak.length && (
          <section className="rounded-2xl border p-3">
            <div className="text-sm font-semibold mb-2">Focus areas</div>
            <ul className="text-sm grid gap-1">
              {weak.map(w=> {
                const R = recs.find(r=> r.tag===w.tag);
                return (
                  <li key={w.tag}>
                    <span className="font-mono">#{w.tag}</span> — {w.missed} missed{R?.href && (<>
                      {' · '}<a className="underline" href={R.href}>Review module</a>
                    </>)}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <div className="flex gap-2">
          <button className="btn bg-[#F76511] text-white" onClick={()=> { location.reload(); }} aria-label="Retake exam with new questions">{t('exam.retake_exam')}</button>
          <a className="btn border" href="/records" aria-label="View your certification records">{t('exam.view_records')}</a>
        </div>
      </main>
    );
  }

  const item = paper.items[i];
  const mm = Math.floor(remaining/60).toString().padStart(2,'0');
  const ss = (remaining%60).toString().padStart(2,'0');

  return (
    <main className="container mx-auto p-4 space-y-3">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b p-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('exam.title')}</h1>
        <div className="text-sm"><span className="font-medium">{t('exam.time_remaining')}:</span> {mm}:{ss}</div>
      </header>

      <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <div className="text-sm text-slate-600 mb-2">Q{i+1} / {paper.items.length}</div>
        <div className="text-base font-medium mb-2">{item.question}</div>
        <div className="grid gap-2">
          {item.choices.map((c:string,idx:number)=> (
            <button key={idx} disabled={remaining===0} className={`text-left border rounded-xl p-3 text-sm tappable ${answers[i]===idx?'border-slate-900':''}`} onClick={()=> pick(idx)}>{c}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <button className="btn border" disabled={i===0} onClick={()=> setI(n=> Math.max(0, n-1))} aria-label={`Go to previous question (${i} of ${paper.items.length})`}>{t('common.back')}</button>
          {i < paper.items.length-1 ? (
            <button className="btn bg-[#F76511] text-white" onClick={()=> setI(n=> Math.min(paper.items.length-1, n+1))} aria-label={`Go to next question (${i + 2} of ${paper.items.length})`}>{t('common.next')}</button>
          ) : (
            <button className="btn bg-[#F76511] text-white" onClick={submit} aria-label="Submit exam for grading">{t('common.submit')}</button>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-2">{t('exam.auto_saved')}</div>
      </section>
    </main>
  );
}
