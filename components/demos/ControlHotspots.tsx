'use client';
import React, { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';
import LiveRegion from '@/components/a11y/LiveRegion';

const TARGETS = [
  { id: 'horn', x: 20, y: 30, labelEn: 'Horn', labelEs: 'Claxon' },
  { id: 'tilt', x: 60, y: 50, labelEn: 'Tilt control', labelEs: 'Control de inclinación' },
  { id: 'lift', x: 75, y: 35, labelEn: 'Lift control', labelEs: 'Control de elevación' }
];

export default function ControlHotspots({ locale }: { locale: 'en'|'es' }) {
  const t = useT();
  const [found, setFound] = useState<string[]>([]);
  useEffect(() => { console.debug('[analytics] demo_start', { demo: 'control_hotspots' }); }, []);
  const allDone = found.length === TARGETS.length;
  useEffect(() => { if (allDone) console.debug('[analytics] demo_complete', { demo: 'control_hotspots' }); }, [allDone]);

  return (
    <section className="rounded-2xl border p-4 shadow-lg">
      <LiveRegion message={allDone ? 'All controls found' : `${found.length} of ${TARGETS.length} found`} />
      <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.objectives', 'Objectives')}</h2>
      <p className="text-sm text-slate-600">Identify key controls by tapping hotspots.</p>
      <div className="mt-3 relative w-full max-w-md aspect-video bg-slate-100 rounded-xl">
        {TARGETS.map((pt) => (
          <button
            key={pt.id}
            aria-label={(locale==='es'?pt.labelEs:pt.labelEn)}
            className={`absolute h-6 w-6 rounded-full border-2 ${found.includes(pt.id)?'bg-emerald-500 border-emerald-600':'bg-white border-slate-400'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]`}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            onClick={() => setFound(prev => prev.includes(pt.id) ? prev : [...prev, pt.id])}
          />
        ))}
      </div>
      <div className="mt-3 text-sm" aria-live="polite">
        {allDone ? t('quiz.correct', 'Correct') : `${found.length}/${TARGETS.length}`}
      </div>
    </section>
  );
}
