'use client';
import { useState } from 'react';

type PlateTip = { equipment_type:string; series:string|null; location_notes:string };
type RangeRow = { model_code:string; serial_range:string; notes:string|null };
type ModelNote = { model_code:string; note:string };
type ApiResp = {
  input?: { serial:string; model:string };
  parsed?: { family:string|null };
  plate?: { guidance: PlateTip[] };
  serialRanges?: RangeRow[];
  modelNotes?: ModelNote[];
  notes?: string[];
  error?: string;
};

export default function Page(){
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [data, setData] = useState<ApiResp|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setLoading(true); setData(null);
    const res = await fetch('/api/hangcha-lookup',{
      method:'POST', headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ serial, model: model || undefined })
    });
    const json = await res.json(); setData(json); setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Hangcha Serial Number Lookup</h1>
      <p className="mt-2 text-slate-600">Enter your serial/PIN and optional model (e.g., CPD25-XC, CPCD30-XF, CPQ30, CQD16, CBD20, CDD16, CJD12). We'll show plate locations, family detection, and model-specific serial notes.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Serial / PIN</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., CPCD30-... • CPD25-... • CQD16-..." value={serial} onChange={(e)=>setSerial(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="CPD • CPCD • CPQ • CQD • CBD • CDD • CJD" value={model} onChange={(e)=>setModel(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Tip: Use the truck data/ID plate and record the full serial exactly as shown.</p>
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
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.family || '—'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Model notes</div>
                  <div className="font-medium">{data.modelNotes?.length ? data.modelNotes.length : '—'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Inputs</div>
                  <div className="font-medium truncate">{data?.input?.model || '—'} · {data?.input?.serial || '—'}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t,i)=> (
                    <li key={i}><span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ''}:</span> {t.location_notes}</li>
                  )) : <li>Use the truck data/ID plate; record the full serial exactly as shown.</li>}
                </ul>
              </div>

              {data.serialRanges?.length ? (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Published serial-range notes</h3>
                  <ul className="list-disc pl-6 text-slate-700">
                    {data.serialRanges.map((r,i)=> (
                      <li key={i}><span className="font-medium">{r.model_code}</span>: {r.serial_range}{r.notes ? ` — ${r.notes}` : ''}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.modelNotes?.length ? (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Model-specific serial notes</h3>
                  <ul className="list-disc pl-6 text-slate-700">
                    {data.modelNotes.map((r,i)=> (
                      <li key={i}><span className="font-medium">{r.model_code}</span>: {r.note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n,i)=>(<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline" href="/jungheinrich-serial-number-lookup">Jungheinrich</a> ·{" "}
                <a className="underline" href="/linde-forklift-serial-number-lookup">Linde</a> ·{" "}
                <a className="underline" href="/manitou-forklift-serial-number-lookup">Manitou</a> ·{" "}
                <a className="underline" href="/hyundai-serial-number-lookup">Hyundai</a> ·{" "}
                <a className="underline" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline" href="/komatsu-serial-number-lookup">Komatsu</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
