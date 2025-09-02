'use client';
import { useMemo, useState, useEffect } from 'react';

export default function LoadCapacityCalc(){
  const [ratedCap, setRatedCap] = useState(4000);
  const [ratedLC, setRatedLC] = useState(24);
  const [weight, setWeight] = useState(2500);
  const [lc, setLC] = useState(24);

  // Simple proportional model: allowable = ratedCap * (ratedLC / actualLC)
  const allowable = useMemo(()=> Math.max(0, Math.round(ratedCap * (ratedLC / Math.max(lc, 1)))), [ratedCap, ratedLC, lc]);
  const pct = useMemo(()=> Math.min(200, Math.round((weight / Math.max(allowable,1)) * 100)), [weight, allowable]);
  const state = pct <= 85 ? 'PASS' : pct <= 100 ? 'CAUTION' : 'FAIL';
  const bar = state==='PASS' ? 'bg-green-600' : state==='CAUTION' ? 'bg-amber-600' : 'bg-red-600';

  useEffect(()=>{ (window as any)?.analytics?.track?.('sim_param_change', { sim:'LoadCapacity', ratedCap, ratedLC, weight, lc }); }, [ratedCap, ratedLC, weight, lc]);

  return (
    <section className='grid gap-3'>
      <div className='rounded-2xl border p-3 bg-white dark:bg-slate-900'>
        <div className='text-sm'>Allowable at current load center</div>
        <div className='text-xl font-semibold'>{allowable.toLocaleString()} lb</div>
        <div className='h-2 rounded bg-slate-200 mt-2 overflow-hidden'><div className={`h-2 ${bar}`} style={{ width: `${Math.min(100,pct)}%` }} /></div>
        <div className='text-xs mt-1'>State: <b>{state}</b> • Demand {weight.toLocaleString()} lb / Allowable {allowable.toLocaleString()} lb</div>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <Num label='Rated capacity (lb)' val={ratedCap} setVal={setRatedCap} step={250} />
        <Num label='Rated load center (in)' val={ratedLC} setVal={setRatedLC} step={1} />
        <Num label='Actual load (lb)' val={weight} setVal={setWeight} step={100} />
        <Num label='Actual load center (in)' val={lc} setVal={setLC} step={1} />
      </div>
      <p className='text-xs text-slate-600'>Rule of thumb: Capacity decreases as load center increases. Always check the truck's data plate.</p>
    </section>
  );
}

function Num({ label, val, setVal, step=1 }:{ label:string; val:number; setVal:(n:number)=>void; step?:number }){
  return (
    <label className='grid rounded-xl border p-2 text-sm'>
      <span className='text-xs text-slate-600'>{label}</span>
      <input type='number' className='border rounded-lg p-2' value={val} onChange={e=> setVal(Number(e.target.value||0))} step={step} />
    </label>
  );
}
