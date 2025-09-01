'use client';
import { useEffect, useMemo, useState } from 'react';
import LiveRegion from '@/components/a11y/LiveRegion';

type MCQ = { type:'mcq'; id:string; prompt:string; options:{id:string; label:string; correct?:boolean}[] };
type NUM = { type:'numeric'; id:string; prompt:string; answer:number; tolerance:number; unit?:string };
type GRID = { type:'hotspot-grid'; id:string; prompt:string; scene?:string; grid:{ cells:('A'|'B'|'C'|'D')[]; correct:'A'|'B'|'C'|'D' } };
export type ExamItem = MCQ | NUM | GRID;

export default function DynamicExam({ slug = 'final-exam' }: { slug?: string }){
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExamItem[]>([]);
  const [passPct, setPassPct] = useState(0.8);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [reviewOnly, setReviewOnly] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/exam/${slug === 'final-exam' ? 'final' : slug}.json`, { cache: 'no-store' });
      const { items, passPct } = await res.json();
      setItems(items || []); 
      setPassPct(passPct ?? 0.8); 
      setLoading(false);
      try { 
        window.dispatchEvent(new CustomEvent('analytics', { detail: { evt: 'exam_start', slug } })); 
      } catch {}
    })();
  }, [slug]);

  const order = useMemo(() => (reviewOnly ? items.filter(i => reviewOnly.includes(i.id)) : items), [items, reviewOnly]);
  const current = order[idx];
  const correctIds = useMemo(() => items.filter(isCorrect).map(i => i.id), [items, answers]);

  function isCorrect(item: ExamItem): boolean {
    const val = answers[item.id];
    if (item.type === 'mcq') return !!item.options.find(o => o.id === val && o.correct);
    if (item.type === 'numeric') return typeof val === 'number' && Math.abs(val - item.answer) <= item.tolerance;
    if (item.type === 'hotspot-grid') return val === item.grid.correct;
    return false;
  }

  function submit() {
    if (!current) return;
    setRevealed(r => ({ ...r, [current.id]: true }));
    try { 
      window.dispatchEvent(new CustomEvent('analytics', { 
        detail: { 
          evt: 'exam_item_answered', 
          slug, 
          id: current.id, 
          ok: isCorrect(current) 
        } 
      })); 
    } catch {}
  }

  function next() { if (idx < order.length - 1) setIdx(idx + 1); }
  function prev() { if (idx > 0) setIdx(idx - 1); }

  function finish() {
    setFinished(true);
    const score = items.length ? correctIds.length / items.length : 0;
    const passed = score >= passPct;
    try { 
      window.dispatchEvent(new CustomEvent('analytics', { 
        detail: { 
          evt: passed ? 'exam_passed' : 'exam_failed', 
          slug, 
          score: Math.round(score * 100) 
        } 
      })); 
    } catch {}
  }

  function retryIncorrectOnly() {
    const incorrect = items.filter(i => !isCorrect(i)).map(i => i.id);
    setReviewOnly(incorrect);
    setIdx(0);
    setFinished(false);
    setRevealed({});
  }

  const score = useMemo(() => (items.length ? correctIds.length / items.length : 0), [correctIds.length, items.length]);
  const passed = score >= passPct;

  if (loading) return <div className="text-center py-8">Loading exam…</div>;
  
  if (finished) {
    return (
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <h2 className="text-lg font-semibold">{passed ? 'Passed' : 'Try again'}</h2>
        <div className="text-sm text-slate-700 dark:text-slate-300">Score: {Math.round(score*100)}%</div>
        <div className="mt-3 flex gap-2">
          {passed ? (
            <a href="/records" className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">View certificate</a>
          ) : (
            <button onClick={retryIncorrectOnly} className="rounded-2xl border px-4 py-2 text-sm">Retry incorrect only</button>
          )}
        </div>
      </section>
    );
  }

  if (!current) return <div className="text-center py-8">No exam items available</div>;

  return (
    <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Final exam</h2>
        <div className="text-sm">{idx+1} / {order.length}</div>
      </header>

      <LiveRegion text={revealed[current?.id||''] ? (isCorrect(current) ? 'Correct' : 'Incorrect') : ''} />

      <div id={`q_${current.id}_label`} className="text-base font-medium mb-3">{current.prompt}</div>

              {current.type === 'mcq' && (
                    <div role="group" aria-labelledby={`q_${current.id}_label`} className="grid gap-2">
          {current.options.map(o => (
            <div key={o.id}>
              <label className={`w-full inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${answers[current.id]===o.id ? 'border-slate-900 dark:border-slate-100' : ''}`}>
                <input 
                  type="radio" 
                  name={current.id} 
                  value={o.id} 
                  checked={answers[current.id]===o.id} 
                  onChange={()=>setAnswers(a=>({...a,[current.id]:o.id}))}
                  aria-describedby={`q_${current.id}_label`}
                />
                <span>{o.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}

            {current.type === 'numeric' && (
        <div className="space-y-2">
          <label htmlFor={`num_${current.id}`} className="text-sm">Answer (number)</label>
          <input 
            id={`num_${current.id}`}
            inputMode="numeric" 
            pattern="[0-9]*" 
            className="rounded-xl border px-3 py-2 w-40 dark:bg-slate-800 dark:border-slate-600"
            aria-describedby={`q_${current.id}_label`} 
            placeholder="Enter number"
            value={answers[current.id] ?? ''} 
            onChange={e=>{
              const v = e.currentTarget.value; 
              const n = Number(v); 
              setAnswers(a=>({...a,[current.id]: Number.isFinite(n) ? n : ''}));
            }} 
          />
          {current.unit && <div className="text-xs text-slate-500">Unit: {current.unit}</div>}
        </div>
      )}

      {current.type === 'hotspot-grid' && (
        <div>
          <div className="mb-2 text-xs text-slate-500">Scene: {current.scene || 'Grid'}</div>
          <div role="group" aria-labelledby={`q_${current.id}_label`} className="grid grid-cols-2 gap-2 max-w-sm">
            {current.grid.cells.map(c => (
              <button 
                key={c} 
                onClick={()=>setAnswers(a=>({...a,[current.id]:c}))} 
                aria-pressed={answers[current.id]===c}
                className={`h-20 rounded-xl border text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${answers[current.id]===c ? 'border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {revealed[current.id] && (
        <div aria-live="polite" className={`mt-3 text-sm ${isCorrect(current)?'text-emerald-700 dark:text-emerald-400':'text-rose-700 dark:text-rose-400'}`}>
          {isCorrect(current) ? 'Correct.' : 'Incorrect.'}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button 
          onClick={submit} 
          disabled={!answers[current.id] && answers[current.id] !== 0}
          className="rounded-2xl border px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check
        </button>
        <button 
          onClick={prev} 
          disabled={idx===0} 
          className="rounded-2xl border px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {idx < order.length - 1 ? (
          <button 
            onClick={next} 
            className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm shadow-lg"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={finish} 
            className="rounded-2xl bg-[#F76511] text-white px-4 py-2 text-sm shadow-lg"
          >
            Finish
          </button>
        )}
      </div>
    </section>
  );
}
