'use client';
import { useState } from 'react';

type PlateTip = { equipment_type:string; series:string|null; location_notes:string };
type ModelNote = { model_code:string; note:string };
type ApiResp = {
  input?: { serial:string; model:string };
  parsed?: { family:string|null };
  plate?: { guidance: PlateTip[] };
  modelNotes?: ModelNote[];
  notes?: string[];
  disclaimer?: string;
  error?: string;
};

export default function Page(){
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [data, setData] = useState<ApiResp|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setLoading(true); setData(null);
    const res = await fetch('/api/haulotte-lookup', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ serial, model: model || undefined }) });
    const json = await res.json(); setData(json); setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Haulotte Serial Number Lookup</h1>
      <p className="mt-2 text-slate-600">Enter your serial/PIN and optional model (e.g., HA16 RTJ PRO, HT67 RTJ PRO, COMPACT 12, OPTIMUM 1931E, STAR 10, 3522A). We'll show plate locations and practical notes.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Serial / PIN</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., HA16RTJ… • HT67RTJ… • OPTIMUM 1931E …" value={serial} onChange={(e)=>setSerial(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="HA… • HT… • COMPACT… • OPTIMUM… • STAR… • 3522A/HTA…" value={model} onChange={(e)=>setModel(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Tip: Record the Serial Number from the manufacturer/ID plate exactly as shown.</p>
        </div>
        <button type="submit" className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50" disabled={loading}>{loading ? 'Checking…' : 'Check Serial'}</button>
      </form>

      {data && (
        <div className="mt-6 rounded-2xl border p-5 bg-slate-50">
          {'error' in data && data.error ? (
            <p className="text-red-600">Error: {data.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3 border"><div className="text-slate-500">Family</div><div className="font-medium">{data.parsed?.family || '—'}</div></div>
                <div className="rounded-xl bg-white p-3 border"><div className="text-slate-500">Model notes</div><div className="font-medium">{data.modelNotes?.length || 0}</div></div>
                <div className="rounded-xl bg-white p-3 border"><div className="text-slate-500">Inputs</div><div className="font-medium truncate">{data?.input?.model || '—'} · {data?.input?.serial || '—'}</div></div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t,i)=> (
                    <li key={i}><span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ''}:</span> {t.location_notes}</li>
                  )) : <li>Use the manufacturer/ID plate on the chassis; record the full serial number.</li>}
                </ul>
              </div>

              {data.modelNotes?.length ? (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Model-specific serial notes</h3>
                  <ul className="list-disc pl-6 text-slate-700">
                    {data.modelNotes.map((r,i)=> (<li key={i}><span className="font-medium">{r.model_code}</span>: {r.note}</li>))}
                  </ul>
                </div>
              ) : null}

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n,i)=>(<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {data.disclaimer ? <p className="mt-6 text-xs text-slate-500">{data.disclaimer}</p> : null}

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline" href="/jlg-serial-number-lookup">JLG</a> ·{" "}
                <a className="underline" href="/genie-serial-number-lookup">Genie</a> ·{" "}
                <a className="underline" href="/skyjack-serial-number-lookup">Skyjack</a> ·{" "}
                <a className="underline" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline" href="/hangcha-serial-number-lookup">Hangcha</a> ·{" "}
                <a className="underline" href="/manitou-forklift-serial-number-lookup">Manitou</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
