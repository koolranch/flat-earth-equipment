"use client";
import { useState } from "react";

type PlateTip = { equipment_type: string; series: string | null; location_notes: string; };
type RangeRow = { model_number: string; serial_range: string; notes: string | null };
type ApiResp = {
  input?: { serial: string; model: string | null; equipmentType: string | null };
  parsed?: { inferredCue: string | null; family: string | null; modelNumber: string | null };
  plate?: { guidance: PlateTip[] };
  serialRanges?: RangeRow[];
  notes?: string[];
  error?: string;
};

const TYPES = [
  "Compact Utility Loader (Dingo)",
  "Telescoping Track Loader",
  "Material Buggy",
  "Any"
];

export default function Page() {
  const [equipmentType, setType] = useState("Any");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true); 
    setData(null);
    const res = await fetch("/api/toro-lookup", {
      method: "POST", 
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serial,
        model: model || undefined,
        equipmentType: equipmentType === "Any" ? undefined : equipmentType
      })
    });
    const json = await res.json(); 
    setData(json); 
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Toro Serial Number Lookup</h1>
      <p className="mt-2 text-slate-600">
        Built for construction models only (Dingo & material buggies). Enter your serial and optional model.
        We'll show plate/decal locations by family, note InfoCenter behavior (TXL), and surface known serial-range blocks (e.g., e-Dingo 22218).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Equipment Type</label>
            <select className="w-full rounded-xl border px-3 py-2" value={equipmentType} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serial</label>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., TX 1000 A12345, TXL 2000, 22218, MB TX 2500S" value={serial} onChange={(e) => setSerial(e.target.value)} required />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Classic Dingo TX plates are under the hood near the belt drive; TXL shows Model/Serial in the InfoCenter "About" screen.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., TX 1000, TX 427, TX 525, 323, 22218 (e-Dingo), MB TX 2500" value={model} onChange={(e) => setModel(e.target.value)} />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Inferred cue</div>
                  <div className="font-medium">{data.parsed?.inferredCue || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.family || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Model # (digits)</div>
                  <div className="font-medium">{data.parsed?.modelNumber || "—"}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find your plate/decal</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ""}:</span> {t.location_notes}
                    </li>
                  )) : <li>Check the model/serial decal on the chassis; many units include a QR code; some TX units place the plate under the hood.</li>}
                </ul>
              </div>

              {data.serialRanges?.length ? (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Known serial blocks for your model</h3>
                  <ul className="list-disc pl-6 text-slate-700">
                    {data.serialRanges.map((r, i) => (
                      <li key={i}><span className="font-medium">{r.model_number}</span>: {r.serial_range}{r.notes ? ` — ${r.notes}` : ""}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n, i) => (<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {/* Related Resources Section */}
              <section className="mt-8 p-4 bg-white rounded-xl border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    href="/osha-operator-training"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Equipment Training
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Certified operator courses
                    </div>
                  </a>
                  <a
                    href="/quote"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Get Parts Quote
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Toro parts pricing
                    </div>
                  </a>
                  <a
                    href="/parts/construction-equipment-parts"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Toro Parts
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Construction equipment parts
                    </div>
                  </a>
                  <a
                    href="/battery-chargers"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Battery Chargers
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Equipment battery solutions
                    </div>
                  </a>
                </div>
              </section>

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
                <a className="underline" href="/jlg-serial-number-lookup">JLG</a> ·{" "}
                <a className="underline" href="/jcb-serial-number-lookup">JCB</a> ·{" "}
                <a className="underline" href="/case-serial-number-lookup">CASE</a> ·{" "}
                <a className="underline" href="/unicarriers-serial-number-lookup">UniCarriers</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
