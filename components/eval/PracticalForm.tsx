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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F76511] rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Supervisor Practical Evaluation</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Complete this OSHA-required practical evaluation to certify operator competency per 29 CFR 1910.178. 
            Supervisor completes on site while learner stays signed in.
          </p>
        </header>

        {/* Evaluator Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-2xl font-bold text-slate-900">Evaluator Information</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">Supervisor Name *</span>
              <input 
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] transition-colors text-slate-900" 
                value={evaluatorName} 
                onChange={e=>setEvaluatorName(e.target.value)}
                placeholder="John Smith"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">Title</span>
              <input 
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] transition-colors text-slate-900" 
                value={evaluatorTitle} 
                onChange={e=>setEvaluatorTitle(e.target.value)}
                placeholder="Safety Manager"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">Site / Location</span>
              <input 
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] transition-colors text-slate-900" 
                value={site} 
                onChange={e=>setSite(e.target.value)}
                placeholder="Warehouse A, Phoenix"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">Evaluation Date</span>
              <input 
                type="date" 
                className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] transition-colors text-slate-900" 
                value={date} 
                onChange={e=>setDate(e.target.value)} 
              />
            </label>
          </div>
        </div>

        {/* Competency Checklist */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-2xl font-bold text-slate-900">Competency Checklist</h2>
          </div>
          <p className="text-slate-600 mb-8">Evaluate each skill based on OSHA 29 CFR 1910.178 requirements. Check each item the operator demonstrates competently.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <fieldset className="bg-slate-50 rounded-xl p-6 space-y-4">
              <legend className="font-bold text-lg text-slate-900 flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">1</span>
                Pre-Operation
              </legend>
              {['ppe','forksDown','brakeSet'].map(k => (
                <label key={k} className="flex items-center gap-4 text-base p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={(ck as any).preOp[k]} 
                    onChange={()=>toggle(`preOp.${k}`)} 
                    className="w-6 h-6 rounded-md border-2 border-slate-400 text-[#F76511] focus:ring-2 focus:ring-[#F76511] focus:ring-offset-2"
                  /> 
                  <span className="text-slate-800 font-medium">{k==='ppe'?'PPE on':k==='forksDown'?'Forks down':'Parking brake set'}</span>
                </label>
              ))}
            </fieldset>
          
            <fieldset className="bg-slate-50 rounded-xl p-6 space-y-4">
              <legend className="font-bold text-lg text-slate-900 flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">2</span>
                Maneuvers
              </legend>
              {['startStopSmooth','slowTurns','hornAtCorners'].map(k => (
                <label key={k} className="flex items-center gap-4 text-base p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={(ck as any).maneuvers[k]} 
                    onChange={()=>toggle(`maneuvers.${k}`)} 
                    className="w-6 h-6 rounded-md border-2 border-slate-400 text-[#F76511] focus:ring-2 focus:ring-[#F76511] focus:ring-offset-2"
                  /> 
                  <span className="text-slate-800 font-medium">{k==='startStopSmooth'?'Starts/stops smooth':k==='slowTurns'?'Slow controlled turns':'Horn at corners'}</span>
                </label>
              ))}
            </fieldset>
            
            <fieldset className="bg-slate-50 rounded-xl p-6 space-y-4">
              <legend className="font-bold text-lg text-slate-900 flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">3</span>
                Load Handling
              </legend>
              {['lowTiltBack','capacityRespected'].map(k => (
                <label key={k} className="flex items-center gap-4 text-base p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={(ck as any).loadHandling[k]} 
                    onChange={()=>toggle(`loadHandling.${k}`)} 
                    className="w-6 h-6 rounded-md border-2 border-slate-400 text-[#F76511] focus:ring-2 focus:ring-[#F76511] focus:ring-offset-2"
                  /> 
                  <span className="text-slate-800 font-medium">{k==='lowTiltBack'?'Load low, mast back':'Capacity respected'}</span>
                </label>
              ))}
            </fieldset>
            
            <fieldset className="bg-slate-50 rounded-xl p-6 space-y-4">
              <legend className="font-bold text-lg text-slate-900 flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F76511] text-white flex items-center justify-center text-sm font-bold">4</span>
                Shutdown
              </legend>
              {['neutral','forksDown','keyOff','branchOK'].map(k => (
                <label key={k} className="flex items-center gap-4 text-base p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    checked={(ck as any).shutdown[k]} 
                    onChange={()=>toggle(`shutdown.${k}`)} 
                    className="w-6 h-6 rounded-md border-2 border-slate-400 text-[#F76511] focus:ring-2 focus:ring-[#F76511] focus:ring-offset-2"
                  /> 
                  <span className="text-slate-800 font-medium">{k==='neutral'?'Shift to neutral/park':k==='forksDown'?'Forks lowered to floor':k==='keyOff'?'Parking brake set, key off':k==='branchOK'?'Battery disconnected (if applicable)':'Step complete'}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </section>

        {/* Pass/Fail and Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 grid md:grid-cols-2 gap-8">
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

        <div className="flex gap-4 pt-4">
          <button 
            disabled={busy || !evaluatorName || !sigDataUrl} 
            onClick={submit} 
            className={`rounded-xl px-8 py-3 text-base font-semibold shadow-lg text-white transition-colors ${
              busy||!evaluatorName||!sigDataUrl? 'bg-slate-400 cursor-not-allowed':'bg-[#F76511] hover:bg-[#F76511]/90'
            }`}
          >
            {busy?'Saving…':'Save evaluation'}
          </button>
          <a href="/records" className="rounded-xl border-2 border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Go to Records
          </a>
        </div>

        {ok === true && <div className="text-emerald-700 text-base font-medium bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">✅ Evaluation saved successfully.</div>}
        {ok === false && <div className="text-rose-700 text-base font-medium bg-rose-50 border border-rose-200 rounded-lg p-3 mt-4">❌ Could not save evaluation. Please try again.</div>}
      </section>
    </div>
  );
}
