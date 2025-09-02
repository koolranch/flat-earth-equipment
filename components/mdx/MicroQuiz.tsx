'use client';
import { useEffect, useState } from 'react';

export default function MicroQuiz({ id, items }:{ id:string; items: { q:string; choices:string[]; correct:number; explain?:string }[] }){
  const [i,setI] = useState(0);
  const [picked,setPicked] = useState<number|null>(null);
  const [correct,setCorrect] = useState<number>(0);
  const cur = items[i];
  useEffect(()=>{ (window as any)?.analytics?.track?.('quiz_item_start', { id, i }); },[i,id]);
  function answer(idx:number){
    setPicked(idx);
    const ok = idx===cur.correct;
    setCorrect(c=> c + (ok?1:0));
    (window as any)?.analytics?.track?.('quiz_item_answered', { id, i, ok });
  }
  function next(){ setPicked(null); setI(n=> Math.min(n+1, items.length)); }
  const done = i>=items.length;
  if (done){
    const pct = Math.round(100*correct/items.length);
    return <div className="rounded-2xl border p-3">Score: {pct}% ({correct}/{items.length})</div>;
  }
  return (
    <div className="rounded-2xl border p-3 bg-white dark:bg-slate-900 space-y-2">
      <div className="text-sm font-medium">{cur.q}</div>
      <div className="grid gap-2">{cur.choices.map((c,idx)=> (
        <button key={idx} onClick={()=>answer(idx)} disabled={picked!==null} className={`text-left border rounded-xl p-2 text-sm ${picked===idx? (idx===cur.correct? 'bg-green-50 border-green-300':'bg-red-50 border-red-300') : ''}`}>{c}</button>
      ))}</div>
      {picked!==null && (<div className="text-xs text-slate-700">{cur.explain || (picked===cur.correct? 'Correct.':'Review the concept above.')}</div>)}
      <div className="flex gap-2">
        <button className="rounded-2xl bg-[#F76511] text-white px-3 py-1 text-sm" onClick={next}>{i===items.length-1? 'Finish':'Next'}</button>
      </div>
    </div>
  );
}
