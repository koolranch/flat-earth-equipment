"use client";
import { useEffect, useMemo, useState } from 'react';
import { ampsFrom } from '@/lib/recsUtil';

export default function SelectorDebugPanel({ voltage, speed, phase }: { voltage?: number|null; speed?: 'overnight'|'fast'|null; phase?: '1P'|'3P'|null; }){
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const amps = useMemo(()=> ampsFrom(voltage ?? null, speed || 'overnight'), [voltage, speed]);

  useEffect(()=>{
    const u = new URL('/api/debug/recommend', window.location.origin);
    if(voltage) u.searchParams.set('voltage', String(voltage));
    if(speed) u.searchParams.set('speed', speed);
    if(phase) u.searchParams.set('phase', phase);
    fetch(u.toString()).then(r=>r.json()).then(j=>{ if(j.ok) setData(j.summary); else setError(j.error||'err'); }).catch(e=> setError(String(e)));
  }, [voltage, speed, phase]);

  if(process.env.NEXT_PUBLIC_DEBUG_SELECTOR !== '1') return null;

  return (
    <div className="mt-3 rounded-lg border bg-white p-3 text-[12px] text-neutral-700">
      <div className="flex items-center justify-between">
        <b>Selector Debug</b>
        <span className="text-xs text-neutral-500">(only visible with ?debug=1 or env)</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>Voltage: <b>{voltage ?? '—'}</b></div>
        <div>Speed: <b>{speed ?? '—'}</b></div>
        <div>Phase: <b>{phase ?? '—'}</b></div>
        <div>Computed Amps: <b>{amps ?? '—'}</b></div>
      </div>
      {error && <p className="mt-2 text-amber-700">API error: {error}</p>}
      {data && (
        <div className="mt-2">
          <div>Counts → Best: <b>{data.counts.best}</b> • Alt: <b>{data.counts.alternate}</b> • Total: <b>{data.counts.total}</b></div>
          <div className="mt-1">Best slugs: <code>{(data.bestSlugs||[]).join(', ')||'—'}</code></div>
          <div>Alt slugs: <code>{(data.altSlugs||[]).join(', ')||'—'}</code></div>
        </div>
      )}
    </div>
  );
}
