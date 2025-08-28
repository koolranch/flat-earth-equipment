'use client';
import React, { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

type Node = { id: string; promptEn: string; promptEs: string; yes?: string; no?: string; end?: { ok: boolean; tipEn: string; tipEs: string } };
const FLOW: Record<string, Node> = {
  start: { id: 'start', promptEn: 'Any visible leaks under the truck?', promptEs: '¿Fugas visibles bajo el montacargas?', yes: 'fail', no: 'brakes' },
  brakes: { id: 'brakes', promptEn: 'Parking brake holds?', promptEs: '¿El freno de estacionamiento sostiene?', yes: 'ok', no: 'fail' },
  ok: { id: 'ok', promptEn: 'Good to proceed.', promptEs: 'Listo para continuar.', end: { ok: true, tipEn: 'Document pre-op check.', tipEs: 'Documenta la revisión previa.' } },
  fail: { id: 'fail', promptEn: 'Remove from service.', promptEs: 'Retirar de servicio.', end: { ok: false, tipEn: 'Tag out and report.', tipEs: 'Bloquea y reporta.' } }
};

export default function PreOpDecisionTree({ locale }: { locale: 'en'|'es' }) {
  const t = useT();
  const [id, setId] = useState('start');
  useEffect(() => { console.debug('[analytics] demo_start', { demo: 'preop_decision' }); }, []);
  useEffect(() => { if (FLOW[id].end) console.debug('[analytics] demo_complete', { demo: 'preop_decision', ok: FLOW[id].end?.ok }); }, [id]);

  const node = FLOW[id];
  return (
    <section className="rounded-2xl border p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.objectives', 'Objectives')}</h2>
      <p className="mt-2 text-base">{locale==='es'?node.promptEs:node.promptEn}</p>
      {node.end ? (
        <div className={`mt-3 text-sm ${node.end.ok?'text-emerald-700':'text-red-700'}`}>{locale==='es'?node.end.tipEs:node.end.tipEn}</div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button className="rounded-2xl bg-[#F76511] text-white px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]" onClick={() => setId(node.yes!)}>{locale==='es'?'Sí':'Yes'}</button>
          <button className="rounded-2xl border px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F76511]" onClick={() => setId(node.no!)}>{locale==='es'?'No':'No'}</button>
        </div>
      )}
    </section>
  );
}
