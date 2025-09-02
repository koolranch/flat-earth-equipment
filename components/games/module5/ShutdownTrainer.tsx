'use client';
import { useEffect, useMemo, useState } from 'react';
const STEPS = ['Shift to neutral','Steer wheels straight','Set parking brake','Lower forks to floor','Key off / remove','Plug in charger (if electric)','Apply wheel chock'];
const ORDER = [0,1,2,3,4,5,6];

export default function ShutdownTrainer(){
  const [picked, setPicked] = useState<number[]>([]);
  const nextIndex = picked.length;
  const nextCorrect = ORDER[nextIndex];
  const done = picked.length === ORDER.length;

  useEffect(()=>{ (window as any)?.analytics?.track?.('demo_start', { demo:'ShutdownTrainer' }); },[]);
  useEffect(()=>{ if (done) (window as any)?.analytics?.track?.('demo_complete', { demo:'ShutdownTrainer' }); }, [done]);

  function choose(i:number){
    if (done) return;
    const ok = i === nextCorrect;
    setPicked(p=> ok ? [...p, i] : p);
  }

  return (
    <section className='grid gap-3'>
      <div className='text-sm text-slate-700'>Tap each step in order. Wrong taps are ignored.</div>
      <ol className='grid gap-2'>
        {STEPS.map((s, i)=> {
          const state = picked.includes(i) ? 'done' : (i===nextCorrect ? 'next' : 'idle');
          const cls = state==='done' ? 'border-green-400 bg-green-50' : state==='next' ? 'border-slate-900' : 'border-slate-200';
          return (
            <li key={i}>
              <button className={`w-full text-left border rounded-xl p-2 ${cls}`} onClick={()=> choose(i)}>{i+1}. {s}</button>
            </li>
          );
        })}
      </ol>
      {done && <div className='text-sm text-green-700'>Sequence complete. Good shutdown practice.</div>}
    </section>
  );
}
