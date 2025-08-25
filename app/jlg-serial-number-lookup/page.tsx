"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import BrandHubBanner from '@/components/brand/BrandHubBanner';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';

type PlateTip = { equipment_type:string; series:string|null; location_notes:string; };
type ApiResp = {
  input?: { serial:string; model:string|null; equipmentType:string|null };
  parsed?: { inferredPrefix:string|null; inferredFamily:string|null; vinYear:number|null; esCountry: { prefix:string; country:string } | null };
  plate?: { guidance: PlateTip[] };
  notes?: string[];
  error?: string;
};

const TYPES = [
  "Boom Lift (Telescopic)",
  "Boom Lift (Articulating)",
  "Scissor (ES/Slab)",
  "Scissor (RT)",
  "Telehandler",
  "Mast/Toucan",
  "Any"
];

export default function Page(){
  const [equipmentType, setType] = useState("Any");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResp|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setLoading(true); setData(null);
    const res = await fetch("/api/jlg-lookup",{
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({
        serial,
        model: model || undefined,
        equipmentType: equipmentType === "Any" ? undefined : equipmentType
      })
    });
    const json = await res.json(); setData(json); setLoading(false);
  }

  return (
    <>
      <SerialToolJsonLd 
        name="JLG Serial Number Lookup" 
        url="/jlg-serial-number-lookup" 
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">JLG Serial Number Lookup</h1>
        
        <BrandHubBanner slug="jlg" brandName="JLG" />
      
      <p className="mt-2 text-slate-600">
        Enter a JLG serial/PIN (and optional model). We'll show plate/stamped-frame locations by family,
        infer the family from model prefixes (AJ/SJ/ES/RT/Toucan, etc.), decode model year only when a true 17-character VIN/PIN is detected,
        and for ES scissors, hint the country of manufacture from the serial prefix.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Equipment Type</label>
            <select className="w-full rounded-xl border px-3 py-2" value={equipmentType} onChange={(e)=>setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serial / PIN</label>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 600S A12345, 1930ES 02XXXXXXX, or a 17-char VIN/PIN" value={serial} onChange={(e)=>setSerial(e.target.value)} required />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Many JLG booms have the plate on the left rear of the frame; ES scissors commonly place it on the frame (front center/left rear by series).
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 450AJ, 600S, 1930ES, 3394RT, 1255, Toucan 26E" value={model} onChange={(e)=>setModel(e.target.value)} />
        </div>

        <button type="submit" className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50" disabled={loading}>
          {loading ? "Checking…" : "Check Serial"}
        </button>
      </form>

      {data && (
        <div className="mt-6 rounded-2xl border p-5 bg-slate-50">
          {"error" in data && data.error ? (
            <p className="text-red-600">Error: {data.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Prefix</div>
                  <div className="font-medium">{data.parsed?.inferredPrefix || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.inferredFamily || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Model year (VIN/PIN)</div>
                  <div className="font-medium">{data.parsed?.vinYear ?? "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">ES country (prefix)</div>
                  <div className="font-medium">
                    {data.parsed?.esCountry ? `${data.parsed.esCountry.country} (${data.parsed.esCountry.prefix})` : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find your plate</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t,i)=>(
                    <li key={i}>
                      <span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ""}:</span> {t.location_notes}
                    </li>
                  )) : <li>Check the data/name plate on the chassis; frame is stamped if the plate is missing.</li>}
                </ul>
              </div>

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n,i)=>(<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {/* Related Resources */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/safety" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                    <div className="text-2xl mb-2">🎓</div>
                    <h4 className="font-medium text-slate-900 group-hover:text-black">Aerial Lift Training</h4>
                    <p className="text-sm text-slate-600 mt-1">OSHA-compliant aerial lift certification</p>
                  </Link>
                  
                  <Link href="/quote" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-medium text-slate-900 group-hover:text-black">Get a Parts Quote</h4>
                    <p className="text-sm text-slate-600 mt-1">Fast quotes for JLG parts</p>
                  </Link>
                  
                  <Link href="/parts" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                    <div className="text-2xl mb-2">🔧</div>
                    <h4 className="font-medium text-slate-900 group-hover:text-black">JLG Parts</h4>
                    <p className="text-sm text-slate-600 mt-1">Genuine and aftermarket parts</p>
                  </Link>

                  <Link href="/rental" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                    <div className="text-2xl mb-2">📅</div>
                    <h4 className="font-medium text-slate-900 group-hover:text-black">JLG Rentals</h4>
                    <p className="text-sm text-slate-600 mt-1">Boom lifts, scissors, and telehandlers</p>
                  </Link>
                </div>
              </div>

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                <a className="underline" href="/clark-serial-number-lookup">Clark</a> ·{" "}
                <a className="underline" href="/mitsubishi-serial-number-lookup">Mitsubishi</a> ·{" "}
                <a className="underline" href="/doosan-serial-number-lookup">Doosan</a> ·{" "}
                <a className="underline" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline" href="/genie-serial-number-lookup">Genie</a> ·{" "}
                <a className="underline" href="/bobcat-serial-number-lookup">Bobcat</a> ·{" "}
                <a className="underline" href="/unicarriers-serial-number-lookup">UniCarriers</a>
              </section>
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
}
