"use client";
import React from 'react';
import Asset from './Asset';

export type Hotspot = { id: string; x: number; y: number; label: string; iconId?: string };

type Props = { bgId: string; hotspots: Hotspot[]; onHit?: (id: string) => void };

export default function HotspotOverlay({ bgId, hotspots, onHit }: Props) {
  const [hit, setHit] = React.useState<Record<string, boolean>>({});
  const all = hotspots.length;
  const count = Object.values(hit).filter(Boolean).length;

  function mark(id: string) {
    setHit(h => ({ ...h, [id]: true }));
    onHit?.(id);
  }

  return (
    <div className="relative">
      <Asset id={bgId as any} alt="Inspection diagram" className="w-full h-auto" />
      {hotspots.map(h => (
        <button
          key={h.id}
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border ${hit[h.id] ? 'bg-emerald-500/90 border-emerald-600' : 'bg-white border-slate-300 hover:border-slate-400'} shadow`} 
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          aria-label={h.label}
          onClick={() => mark(h.id)}
        />
      ))}
      <div className="mt-3 text-sm text-slate-600">{count} / {all} checks complete</div>
    </div>
  );
}
