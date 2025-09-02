'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';

type Params = { weight:number; lc:number; tilt:number; speed:number };
function clamp(n:number, a:number, b:number){ return Math.max(a, Math.min(b, n)); }

export default function StabilityTriangleSim({ onComplete }:{ onComplete?:()=>void }){
  const { t } = useI18n();
  const [p, setP] = useState<Params>({ weight: 2500, lc: 24, tilt: 0, speed: 3 });
  const [holdMs, setHoldMs] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(()=>{ (window as any)?.analytics?.track?.('demo_start', { demo:'StabilityTriangle' }); },[]);

  // Simplified model: capacity 4000 lb @ 24in baseline; score penalized by load center, tilt, and speed
  const score = useMemo(()=>{
    const cap = 4000; // rated at 24in
    const lcFactor = p.lc / 24; // >1 is worse
    const weightRatio = p.weight / cap; // >1 is worse
    const tiltPenalty = Math.abs(p.tilt) / 6; // 6° ~ threshold
    const speedPenalty = p.speed / 8; // 8 mph ~ high
    const raw = 1 - (0.55*weightRatio*lcFactor + 0.25*tiltPenalty + 0.20*speedPenalty);
    const s = clamp(Math.round(raw*100), 0, 100);
    return s;
  }, [p]);

  useEffect(()=>{
    if (score >= 80){
      if (timer.current) window.clearInterval(timer.current);
      timer.current = window.setInterval(()=> setHoldMs(ms=> ms+250), 250) as unknown as number;
    } else {
      if (timer.current) window.clearInterval(timer.current);
      setHoldMs(0);
    }
    return ()=>{ if (timer.current) window.clearInterval(timer.current); };
  }, [score]);

  useEffect(()=>{ if (holdMs >= 5000 && onComplete){ onComplete(); (window as any)?.analytics?.track?.('demo_complete', { demo:'StabilityTriangle', score }); } }, [holdMs, onComplete, score]);

  function set<K extends keyof Params>(k:K, v:number){ const nv = { ...p, [k]: v } as Params; setP(nv); (window as any)?.analytics?.track?.('sim_param_change', { demo:'StabilityTriangle', k, v }); }

  const state = score >= 80 ? 'PASS' : score >= 60 ? 'CAUTION' : 'FAIL';
  const stateCls = state==='PASS' ? 'text-green-700' : state==='CAUTION' ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="text-sm">{t('games.stability_score')}</div>
          <div className={`text-lg font-semibold ${stateCls}`}>{state} • {score}%</div>
        </div>
        {/* SVG stability triangle (simple) */}
        <svg viewBox="0 0 200 180" className="w-full mt-2">
          {/* triangle */}
          <polygon points="20,160 180,160 100,20" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
          {/* safe region overlay */}
          <polygon points="40,150 160,150 100,50" fill="#DCFCE7" opacity="0.7" />
          {/* CG indicator mapped from params (toy mapping) */}
          {(() => {
            const x = 100 + (p.lc-24)*2 + p.tilt*2; // push CG forward with lc & tilt
            const y = 140 - (80 * (100-score)/100); // higher score -> closer to top
            return <circle cx={clamp(x,30,170)} cy={clamp(y,40,160)} r="6" fill="#0F172A" />;
          })()}
        </svg>
      </div>

      <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 grid gap-3">
        <Label name={t('games.load_weight')} /><input type="range" min={0} max={6000} value={p.weight} onChange={e=>set('weight', Number(e.target.value))} />
        <Row val={p.weight} unit="lb" hint={t('games.hint_weight')} />
        <Label name={t('games.load_center')} /><input type="range" min={12} max={36} value={p.lc} onChange={e=>set('lc', Number(e.target.value))} />
        <Row val={p.lc} unit="in" hint={t('games.hint_lc')} />
        <Label name={t('games.mast_tilt')} /><input type="range" min={-6} max={6} value={p.tilt} onChange={e=>set('tilt', Number(e.target.value))} />
        <Row val={p.tilt} unit="°" hint={t('games.hint_tilt')} />
        <Label name={t('games.speed')} /><input type="range" min={0} max={10} value={p.speed} onChange={e=>set('speed', Number(e.target.value))} />
        <Row val={p.speed} unit="mph" hint={t('games.hint_speed')} />
        <div className="flex gap-2 mt-2">
          <button className="rounded-2xl border px-3 py-2" onClick={()=> setP({ weight:2500, lc:24, tilt:0, speed:3 })}>{t('games.reset')}</button>
          <button className="rounded-2xl bg-[#F76511] text-white px-3 py-2" onClick={()=>{ onComplete?.(); (window as any)?.analytics?.track?.('demo_complete', { demo:'StabilityTriangle', score }); }}>{t('games.mark_complete')}</button>
        </div>
        {holdMs>0 && <div className="text-xs text-slate-600">{t('games.holding_pass', { s: Math.floor(holdMs/1000) })}</div>}
      </div>
    </div>
  );
}

function Label({ name }:{ name:string }){ return <div className="text-sm font-medium">{name}</div>; }
function Row({ val, unit, hint }:{ val:number; unit:string; hint:string }){
  return <div className="flex items-center justify-between text-xs text-slate-700"><span>{hint}</span><span className="font-mono">{val} {unit}</span></div>;
}
