'use client';
import { useState } from 'react';

type PlateTip = { family: string; component: string; location_note: string };
type ApiResp = {
  input?: { serial: string | null; model: string | null };
  match?: { normalizedModel: string | null; family: string | null };
  plateHelp?: PlateTip[];
  disclaimer?: string;
  notes?: string[];
  error?: string;
};

export default function Page(){
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setLoading(true); setData(null);
    const res = await fetch('/api/manitou-lookup', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ serial, model: model || undefined })
    });
    const json = await res.json(); setData(json); setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Manitou Forklift Serial Number Lookup</h1>
      <p className="mt-2 text-slate-600">Enter your serial/PIN and optional model (e.g., MT 625 H, MT 1440, MRT 2150, MLT 625, MI 25 D, ME 25). We'll show plate locations and practical notes.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Serial / PIN</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., MT 625 H … • MRT 2550 …" value={serial} onChange={e=>setSerial(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="MT 625 H • MT 1840 • MRT 2150 • MLT 733 • MI 25 D • ME 25" value={model} onChange={e=>setModel(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Tip: Record the Serial Number / Product Identification Number exactly as shown on the Manufacturer's plate.</p>
        </div>
        <button type="submit" className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50" disabled={loading}>{loading ? 'Checking…' : 'Check Serial'}</button>
      </form>

      {data && (
        <div className="mt-6 rounded-2xl border p-5 bg-slate-50">
          {'error' in data && data?.error ? (
            <p className="text-red-600">Error: {data.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.match?.family || '—'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Model</div>
                  <div className="font-medium truncate">{data.match?.normalizedModel || data.input?.model || '—'}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Serial</div>
                  <div className="font-medium truncate">{data.input?.serial || '—'}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plateHelp?.length ? data.plateHelp.map((t, i) => (
                    <li key={i}><span className="font-medium">{t.family} — {t.component}:</span> {t.location_note}</li>
                  )) : (
                    <li>Use the Manufacturer's plate; record the Serial Number / Product Identification Number exactly as shown.</li>
                  )}
                </ul>
              </div>

              {data.notes?.length ? (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Helpful notes</h3>
                  <ul className="list-disc pl-6 text-slate-700">
                    {data.notes.map((n, i) => (<li key={i}>{n}</li>))}
                  </ul>
                </div>
              ) : null}

              {data.disclaimer ? (
                <p className="mt-6 text-xs text-slate-500">{data.disclaimer}</p>
              ) : null}

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline" href="/linde-forklift-serial-number-lookup">Linde</a> ·{" "}
                <a className="underline" href="/jungheinrich-serial-number-lookup">Jungheinrich</a> ·{" "}
                <a className="underline" href="/hyundai-serial-number-lookup">Hyundai</a> ·{" "}
                <a className="underline" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                <a className="underline" href="/clark-serial-number-lookup">Clark</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
