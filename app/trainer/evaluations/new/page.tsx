'use client';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import EvalSignature from '@/components/EvalSignature';

export default function NewEval(){
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [id, setId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<{type: 'typed'|'drawn', data: string}|null>(null);

  const [form, setForm] = useState<any>({
    trainee_email: '', course_title: 'Forklift Operator',
    evaluator_name: '', evaluator_title: '', site_location: '',
    evaluation_date: new Date().toISOString().slice(0,10), truck_type: '',
    checklist: { preop:true, seatbelt:true, start:true, travel:true, pedestrians:true, ramps:true, stacking:true, visibility:true, speed:true, attachments:true, battery:true, shutdown:true },
    overall_pass: true, notes: ''
  });
  function up(k:string,v:any){ setForm((s:any)=> ({...s, [k]: v})); }

  async function saveDraft(){
    setLoading(true);
    try {
      const r = await fetch('/api/evaluations', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ ...form, id, signature_base64: signature?.data }) });
      const j = await r.json(); if (j.ok){ setId(j.id); (window as any)?.analytics?.track?.('employer_eval_saved', { id: j.id }); }
    } finally { setLoading(false); }
  }
  async function finalize(){
    if (!id){ await saveDraft(); }
    setLoading(true);
    try{
      const r = await fetch('/api/evaluations/finalize', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id: id }) });
      const j = await r.json(); if (j.ok){ (window as any)?.analytics?.track?.('employer_eval_finalized', { id, url: j.pdf_url }); window.location.href = '/records'; }
    } finally { setLoading(false); }
  }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">{t('evaluation.title')}</h1>

      {step===1 && (
        <section className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm"><span>{t('evaluation.trainee_email')}</span><input className="border rounded-xl p-2 tappable" value={form.trainee_email} onChange={e=> up('trainee_email', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.course')}</span><input className="border rounded-xl p-2 tappable" value={form.course_title} onChange={e=> up('course_title', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.evaluator_name')}</span><input className="border rounded-xl p-2 tappable" value={form.evaluator_name} onChange={e=> up('evaluator_name', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.evaluator_title')}</span><input className="border rounded-xl p-2 tappable" value={form.evaluator_title} onChange={e=> up('evaluator_title', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.site_location')}</span><input className="border rounded-xl p-2 tappable" value={form.site_location} onChange={e=> up('site_location', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.evaluation_date')}</span><input type="date" className="border rounded-xl p-2 tappable" value={form.evaluation_date} onChange={e=> up('evaluation_date', e.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span>{t('evaluation.truck_type')}</span><input className="border rounded-xl p-2 tappable" value={form.truck_type} onChange={e=> up('truck_type', e.target.value)} /></label>
          </div>
          <div className="flex gap-2 justify-end">
            <button data-testid="eval-save-step1" className="btn border" disabled={loading} onClick={saveDraft} aria-label="Save evaluation as draft">{t('evaluation.save_draft')}</button>
            <button data-testid="eval-next" className="btn bg-[#F76511] text-white" disabled={loading} onClick={()=> { (window as any)?.analytics?.track?.('employer_eval_started'); setStep(2); }} aria-label="Continue to checklist and signature">Next</button>
          </div>
        </section>
      )}

      {step===2 && (
        <section className="rounded-2xl border p-4 grid gap-4 bg-white">
          <div>
            <div className="font-semibold mb-2">{t('evaluation.checklist')}</div>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {Object.entries(form.checklist).map(([k,v]: any)=> (
                <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={v} onChange={e=> setForm((s:any)=> ({...s, checklist: { ...s.checklist, [k]: e.target.checked }}))} /> {t(`evaluation.checklist_items.${k}`)}</label>
              ))}
            </div>
          </div>
          <label className="grid gap-1 text-sm"><span>{t('evaluation.notes')}</span><textarea className="border rounded-xl p-2 min-h-[100px] tappable" value={form.notes} onChange={e=> up('notes', e.target.value)} /></label>
          <div className="grid gap-2">
            <div className="text-sm font-semibold">{t('evaluation.signature')}</div>
            <EvalSignature onSignatureChange={setSignature} value={signature} />
            <div className="text-xs text-slate-600">{signature ? t('evaluation.uploaded_signature') : t('evaluation.capture_signature')}</div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm"><span>{t('evaluation.pass_toggle')}</span>
              <input type="checkbox" checked={form.overall_pass} onChange={e=> up('overall_pass', e.target.checked)} /></label>
          </div>
          <div className="flex gap-2 justify-between">
            <button data-testid="eval-back" className="btn border" disabled={loading} onClick={()=> setStep(1)} aria-label="Go back to basic information">Back</button>
            <div className="flex gap-2">
              <button data-testid="eval-save" className="btn border" disabled={loading} onClick={saveDraft} aria-label="Save evaluation as draft">{t('evaluation.save_draft')}</button>
              <button data-testid="eval-finalize" className="btn bg-[#F76511] text-white" disabled={loading} onClick={finalize} aria-label="Submit evaluation and generate PDF">{t('evaluation.submit_and_generate_pdf')}</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
