'use client';
import { useState } from 'react';
import SignaturePad from '@/components/eval/SignaturePad';
import type { PracticalChecklist } from '@/types/practical';

export default function PracticalForm({ enrollmentId, traineeUserId }: { enrollmentId: string; traineeUserId: string }){
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorTitle, setEvaluatorTitle] = useState('');
  const [site, setSite] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [pass, setPass] = useState(true);
  const [sigDataUrl, setSigDataUrl] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<boolean|null>(null);

  const [ck, setCk] = useState<PracticalChecklist>({
    preOp: { ppe: false, forksDown: false, brakeSet: false },
    maneuvers: { startStopSmooth: false, slowTurns: false, hornAtCorners: false },
    loadHandling: { lowTiltBack: false, capacityRespected: false },
    shutdown: { neutral: false, forksDown: false, keyOff: false, branchOK: false }
  });

  function toggle(path: string){
    setCk(prev => {
      const next = structuredClone(prev) as any;
      const [a,b] = path.split('.'); 
      next[a][b] = !next[a][b];
      return next as PracticalChecklist;
    });
  }

  async function submit(){
    setBusy(true); 
    setOk(null);
    
    try {
      let signatureUrl: string|undefined = undefined;
      
      // Upload signature if provided
      if (sigDataUrl){
        const up = await fetch('/api/evaluations/signature', { 
          method: 'POST', 
          headers: { 'Content-Type':'application/json' }, 
          body: JSON.stringify({ dataUrl: sigDataUrl }) 
        });
        const uj = await up.json(); 
        if (uj.ok) signatureUrl = uj.url;
      }
      
      // Submit evaluation
      const res = await fetch('/api/evaluations', { 
        method: 'POST', 
        headers: { 'Content-Type':'application/json' }, 
        body: JSON.stringify({
          enrollmentId, 
          traineeUserId, 
          evaluatorName, 
          evaluatorTitle, 
          siteLocation: site, 
          evaluationDate: date, 
          practicalPass: pass, 
          notes, 
          signatureUrl, 
          checklist: ck 
        }) 
      });
      
      const json = await res.json();
      setOk(json.ok);
      
      if (json.ok){
        try { 
          window.dispatchEvent(new CustomEvent('analytics', { 
            detail: { 
              evt: pass ? 'evaluation_passed' : 'evaluation_failed', 
              enrollmentId 
            } 
          })); 
        } catch {}
      }
    } catch (e) { 
      setOk(false); 
    }
    
    setBusy(false);
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Supervisor Practical Evaluation</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Supervisor completes on site. Learner stays signed in.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block text-sm">
          Supervisor name
          <input 
            className="mt-1 w-full rounded-xl border px-3 py-2" 
            value={evaluatorName} 
            onChange={e=>setEvaluatorName(e.target.value)} 
          />
        </label>
        <label className="block text-sm">
          Title
          <input 
            className="mt-1 w-full rounded-xl border px-3 py-2" 
            value={evaluatorTitle} 
            onChange={e=>setEvaluatorTitle(e.target.value)} 
          />
        </label>
        <label className="block text-sm">
          Site/location
          <input 
            className="mt-1 w-full rounded-xl border px-3 py-2" 
            value={site} 
            onChange={e=>setSite(e.target.value)} 
          />
        </label>
        <label className="block text-sm">
          Date
          <input 
            type="date" 
            className="mt-1 w-full rounded-xl border px-3 py-2" 
            value={date} 
            onChange={e=>setDate(e.target.value)} 
          />
        </label>
      </div>

      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-2">Checklist</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <fieldset className="space-y-2">
            <legend className="font-medium">Pre-operation</legend>
            {['ppe','forksDown','brakeSet'].map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={(ck as any).preOp[k]} 
                  onChange={()=>toggle(`preOp.${k}`)} 
                /> 
                {k==='ppe'?'PPE on':k==='forksDown'?'Forks down':'Parking brake set'}
              </label>
            ))}
          </fieldset>
          
          <fieldset className="space-y-2">
            <legend className="font-medium">Maneuvers</legend>
            {['startStopSmooth','slowTurns','hornAtCorners'].map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={(ck as any).maneuvers[k]} 
                  onChange={()=>toggle(`maneuvers.${k}`)} 
                /> 
                {k==='startStopSmooth'?'Starts/stops smooth':k==='slowTurns'?'Slow controlled turns':'Horn at corners'}
              </label>
            ))}
          </fieldset>
          
          <fieldset className="space-y-2">
            <legend className="font-medium">Load handling</legend>
            {['lowTiltBack','capacityRespected'].map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={(ck as any).loadHandling[k]} 
                  onChange={()=>toggle(`loadHandling.${k}`)} 
                /> 
                {k==='lowTiltBack'?'Load low, mast back':'Capacity respected'}
              </label>
            ))}
          </fieldset>
          
          <fieldset className="space-y-2">
            <legend className="font-medium">Shutdown</legend>
            {['neutral','forksDown','keyOff','branchOK'].map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={(ck as any).shutdown[k]} 
                  onChange={()=>toggle(`shutdown.${k}`)} 
                /> 
                {k==='branchOK'?'Fuel branch action done':'Step complete'}
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <div className="rounded-2xl border p-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pass/fail</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input 
                type="radio" 
                name="pf" 
                checked={pass} 
                onChange={()=>setPass(true)} 
              /> 
              Pass
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input 
                type="radio" 
                name="pf" 
                checked={!pass} 
                onChange={()=>setPass(false)} 
              /> 
              Fail
            </label>
          </div>
          <label className="block text-sm mt-3">
            Notes
            <textarea 
              className="mt-1 w-full rounded-xl border px-3 py-2" 
              rows={4} 
              value={notes} 
              onChange={e=>setNotes(e.target.value)} 
            />
          </label>
        </div>
        <SignaturePad onChange={setSigDataUrl} />
      </div>

      <div className="flex gap-2">
        <button 
          disabled={busy || !evaluatorName || !sigDataUrl} 
          onClick={submit} 
          className={`rounded-2xl px-4 py-2 text-sm shadow-lg text-white ${
            busy||!evaluatorName||!sigDataUrl? 'bg-slate-400 cursor-not-allowed':'bg-[#F76511]'
          }`}
        >
          {busy?'Saving…':'Save evaluation'}
        </button>
        <a href="/records" className="rounded-2xl border px-4 py-2 text-sm">
          Go to Records
        </a>
      </div>

      {ok === true && <div className="text-emerald-700 text-sm">Evaluation saved.</div>}
      {ok === false && <div className="text-rose-700 text-sm">Could not save evaluation.</div>}
    </section>
  );
}
