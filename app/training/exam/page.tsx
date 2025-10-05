'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';

async function api(path:string, init?:RequestInit){ const r = await fetch(path, { cache:'no-store', ...init }); if (!r.ok) throw new Error(path); return r.json(); }

export default function ExamPage(){
  const { t, locale: i18nLocale } = useI18n();
  // Default to English for exam unless user explicitly changed language
  const locale = i18nLocale || 'en';
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
      <main className="container mx-auto max-w-3xl p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('exam.results_title')}</h1>
        
        <div className={`rounded-2xl border-2 p-6 ${result.passed ? 'border-emerald-500 bg-emerald-50' : 'border-amber-500 bg-amber-50'}`}>
          <div className="text-2xl font-bold mb-2">{result.passed ? '🎉 ' + t('exam.passed_title') : t('exam.failed_title')}</div>
          <div className="text-lg text-slate-700">{t('exam.score_label')}: {result.scorePct}% ({result.correct}/{result.total})</div>
        </div>
        
        {result.passed && (
          <div className="rounded-2xl border-2 border-blue-500 bg-blue-50 p-6 space-y-4">
            <h2 className="text-xl font-semibold">📜 Your Certificate</h2>
            <p className="text-slate-700">Congratulations! Your certificate has been generated and is ready to download.</p>
            
            <div className="flex flex-wrap gap-3">
              <a 
                href="/api/certificates/pdf" 
                download
                className="btn-primary tappable px-6 py-3"
              >
                📥 Download Certificate (PDF)
              </a>
              <a 
                href="/api/certificates/wallet" 
                download
                className="tappable rounded-xl border-2 border-blue-600 bg-white px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
              >
                🎫 Download Wallet Card
              </a>
            </div>
            
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Email sent!</strong> Your certificate has been sent to your email address on file.
              </p>
            </div>
          </div>
        )}
        
        {result.passed && (
          <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 space-y-4">
            <h2 className="text-xl font-semibold">⚠️ Important: OSHA Compliance</h2>
            <p className="text-slate-700">
              While you've passed the written exam, <strong>OSHA requires a practical evaluation</strong> by your supervisor before you can operate a forklift independently.
            </p>
            
            <a 
              href="/practical" 
              className="inline-flex items-center gap-2 btn-primary tappable px-6 py-3"
            >
              Complete Practical Evaluation →
            </a>
            
            <p className="text-sm text-slate-600">
              Your supervisor will evaluate your hands-on skills and sign off on your competency.
            </p>
          </div>
        )}
        
        
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
          {incorrect?.length > 0 && <a className="btn border" href={`/training/exam/review?attempt=${result.attempt_id || ''}`}>{t('exam.review_incorrect')}</a>}
          <a className="btn border" href="/records" aria-label="View your certification records">{t('exam.view_records')}</a>
        </div>
      </main>
    );
  }

  const item = paper.items[i];
  const mm = Math.floor(remaining/60).toString().padStart(2,'0');
  const ss = (remaining%60).toString().padStart(2,'0');
  const progressPct = ((i + 1) / paper.items.length) * 100;

  return (
    <main className="container mx-auto p-4 space-y-3">
      {/* Orange Progress Bar */}
      <div className="sticky top-0 z-20 bg-white shadow-md">
        <div className="h-2 bg-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-[#F76511] to-orange-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <header className="sticky top-2 z-10 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-orange-200 shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F76511] to-orange-600 text-white flex items-center justify-center font-bold text-lg">
            {i + 1}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('exam.title')}</h1>
            <p className="text-sm text-slate-600">{t('exam.question')} {i+1} {t('common.of')} {paper.items.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md">
          <span className="text-xl">⏱️</span>
          <span>{mm}:{ss}</span>
        </div>
      </header>

      <section className="rounded-2xl border-2 border-orange-200 p-6 bg-white shadow-lg">
        <div className="text-lg font-semibold mb-6 text-slate-900 leading-relaxed">{item.question}</div>
        <div className="grid gap-3 mb-6">
          {item.choices.map((c:string,idx:number)=> (
            <button 
              key={idx} 
              disabled={remaining===0} 
              className={`
                relative text-left border-2 rounded-xl p-4 text-sm tappable transition-all
                ${answers[i]===idx
                  ?'border-[#F76511] bg-orange-50 shadow-md' 
                  :'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                }
                ${remaining===0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={()=> pick(idx)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers[i]===idx ? 'border-[#F76511] bg-[#F76511]' : 'border-slate-300'}`}>
                  {answers[i]===idx && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="flex-1 text-slate-900">{c}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Visual Progress Dots */}
        <div className="flex items-center justify-center gap-1 mb-4 pb-4 border-t border-slate-200 pt-4">
          {Array.from({ length: paper.items.length }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all ${
                idx < i ? 'bg-emerald-500 w-2' : 
                idx === i ? 'bg-[#F76511] w-8' : 
                'bg-slate-300 w-2'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button 
            className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={i===0} 
            onClick={()=> setI(n=> Math.max(0, n-1))} 
            aria-label={`Go to previous question (${i} of ${paper.items.length})`}
          >
            ← {t('common.back')}
          </button>
          {i < paper.items.length-1 ? (
            <button 
              className="rounded-xl bg-gradient-to-r from-[#F76511] to-orange-600 px-6 py-2.5 font-semibold text-white hover:shadow-lg transition-all" 
              onClick={()=> setI(n=> Math.min(paper.items.length-1, n+1))} 
              aria-label={`Go to next question (${i + 2} of ${paper.items.length})`}
            >
              {t('common.next')} →
            </button>
          ) : (
            <button 
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 font-semibold text-white hover:shadow-lg transition-all" 
              onClick={submit} 
              aria-label="Submit exam for grading"
            >
              ✓ {t('common.submit')}
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-3 text-center bg-slate-50 py-2 rounded-lg">
          💾 {t('exam.auto_saved')}
        </div>
      </section>
    </main>
  );
}
