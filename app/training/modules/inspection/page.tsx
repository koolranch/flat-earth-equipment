"use client";
import React from 'react';
import HotspotOverlay, { Hotspot } from '@/components/training/HotspotOverlay';
import { track } from '@/lib/analytics/track';

const HS: Hotspot[] = [
  { id: 'tires', x: 28, y: 78, label: 'Tires' },
  { id: 'forks', x: 86, y: 74, label: 'Forks' },
  { id: 'chains', x: 57, y: 48, label: 'Chains' },
  { id: 'horn', x: 37, y: 53, label: 'Horn' },
  { id: 'lights', x: 64, y: 46, label: 'Lights' },
  { id: 'hydraulics', x: 72, y: 60, label: 'Hydraulics' },
  { id: 'leaks', x: 62, y: 86, label: 'Leaks' },
  { id: 'data_plate', x: 54, y: 64, label: 'Data plate' }
];

export default function InspectionModule() {
  const [count, setCount] = React.useState(0);
  const total = HS.length;

  function onHit(id: string) {
    track('inspection_hotspot_hit', { id });
    setCount(c => c + 1);
  }

  const done = count >= total;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">8-Point Inspection</h1>
      <HotspotOverlay bgId={'A1_controls'} hotspots={HS} onHit={onHit} />
      <button
        disabled={!done}
        onClick={() => track('inspection_complete', { total })}
        className={`px-5 py-3 rounded-xl font-semibold ${done ? 'bg-black text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
      >
        {done ? 'Continue' : `Complete all ${total} checks`}
      </button>
    </main>
  );
}
