'use client';
import { useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';

const defaultCompetencies = {
  preop: false, controls: false, travel: false, loadHandling: false, pedestrians: false,
  ramps: false, stacking: false, refuel: false, shutdown: false, stability: false
};

type EvalRow = {
  id?: string; enrollment_id: string; evaluator_name?: string; evaluator_title?: string; site_location?: string;
  evaluation_date?: string | null; practical_pass?: boolean | null; notes?: string | null;
  evaluator_signature_url?: string | null; trainee_signature_url?: string | null;
  competencies?: Record<string, boolean> | null;
};

export default function EvalForm({ enrollmentId, initial }: { enrollmentId: string; initial: EvalRow | null }) {
  const [data, setData] = useState<EvalRow>({ enrollment_id: enrollmentId, ...initial });
  const [competencies, setCompetencies] = useState<Record<string, boolean>>({ ...defaultCompetencies, ...(initial?.competencies || {}) });
  const [saving, setSaving] = useState(false);

  useEffect(() => { (window as any)?.analytics?.track?.('eval_open', { enrollmentId }); }, [enrollmentId]);

  function setField<K extends keyof EvalRow>(k: K, v: EvalRow[K]) { setData(d => ({ ...d, [k]: v })); }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/eval/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, competencies }) });
    const j = await res.json();
    setSaving(false);
    if (!j.ok) return alert(j.error || 'Save failed');
    setData(d => ({ ...d, id: j.row.id }));
    (window as any)?.analytics?.track?.('eval_saved', { enrollmentId });
  }

  async function sign(role: 'evaluator' | 'trainee') {
    const id = `sig-${role}`;
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, { backgroundColor: 'rgba(255,255,255,1)' });
    if (pad.isEmpty()) { alert('Draw your signature, then click Save signature'); return; }
    const dataUrl = pad.toDataURL('image/png');
    const res = await fetch('/api/eval/signature', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrollment_id: enrollmentId, role, dataUrl }) });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'Signature failed');
    setData(d => ({ ...d, [`${role}_signature_url` as const]: j.url }));
    (window as any)?.analytics?.track?.('eval_signed', { enrollmentId, role });
  }

  function Check({ k, label }: { k: keyof typeof defaultCompetencies; label: string }) {
    return (
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={!!competencies[k]} onChange={e => setCompetencies(c => ({ ...c, [k]: e.target.checked }))} />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-xl p-2" placeholder="Evaluator name" value={data.evaluator_name || ''} onChange={e => setField('evaluator_name', e.target.value)} />
          <input className="border rounded-xl p-2" placeholder="Evaluator title" value={data.evaluator_title || ''} onChange={e => setField('evaluator_title', e.target.value)} />
          <input className="border rounded-xl p-2" placeholder="Site/location" value={data.site_location || ''} onChange={e => setField('site_location', e.target.value)} />
          <input className="border rounded-xl p-2" type="date" value={(data.evaluation_date || '').slice(0, 10)} onChange={e => setField('evaluation_date', e.target.value)} />
        </div>
        <textarea className="border rounded-xl p-2" rows={3} placeholder="Notes" value={data.notes || ''} onChange={e => setField('notes', e.target.value)} />
      </div>

      <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 grid gap-2">
        <div className="font-semibold">Competencies (OSHA 1910.178(l))</div>
        <div className="grid md:grid-cols-2 gap-2">
          <Check k="preop" label="Pre-operation inspection" />
          <Check k="controls" label="Controls & instrument use" />
          <Check k="travel" label="Safe travel (speed, visibility, horn)" />
          <Check k="loadHandling" label="Load handling & stacking" />
          <Check k="pedestrians" label="Pedestrian safety" />
          <Check k="ramps" label="Ramps & inclines" />
          <Check k="stability" label="Stability triangle awareness" />
          <Check k="refuel" label="Refueling/charging procedures" />
          <Check k="shutdown" label="Parking & shutdown" />
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2"><input type="radio" name="pass" checked={data.practical_pass === true} onChange={() => setField('practical_pass', true)} /> Pass</label>
          <label className="flex items-center gap-2"><input type="radio" name="pass" checked={data.practical_pass === false} onChange={() => setField('practical_pass', false)} /> Needs refresher</label>
          <label className="flex items-center gap-2"><input type="radio" name="pass" checked={data.practical_pass == null} onChange={() => setField('practical_pass', null)} /> Undecided</label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <div className="font-medium mb-2">Evaluator signature</div>
          <canvas id="sig-evaluator" width={480} height={160} className="border rounded-xl bg-white w-full h-40"></canvas>
          <div className="flex gap-2 mt-2">
            <button className="rounded-2xl border px-3 py-2" onClick={() => sign('evaluator')}>Save signature</button>
            {data.evaluator_signature_url && <a className="rounded-2xl border px-3 py-2" target="_blank" href={data.evaluator_signature_url}>View</a>}
          </div>
        </div>
        <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <div className="font-medium mb-2">Trainee signature</div>
          <canvas id="sig-trainee" width={480} height={160} className="border rounded-xl bg-white w-full h-40"></canvas>
          <div className="flex gap-2 mt-2">
            <button className="rounded-2xl border px-3 py-2" onClick={() => sign('trainee')}>Save signature</button>
            {data.trainee_signature_url && <a className="rounded-2xl border px-3 py-2" target="_blank" href={data.trainee_signature_url}>View</a>}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button disabled={saving} className="rounded-2xl bg-[#F76511] text-white px-4 py-2" onClick={save}>{saving ? 'Saving…' : 'Save evaluation'}</button>
        <a className="rounded-2xl border px-4 py-2" target="_blank" href={`/trainer/evaluations/${enrollmentId}/print`}>Print</a>
      </div>
    </section>
  );
}
