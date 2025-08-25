"use client";
import { useState } from "react";
import BrandHubBanner from '@/components/brand/BrandHubBanner';

type PlateTip = { equipment_type: string; series: string | null; location_notes: string; };
type Series = { code: string; example_note: string };
type ApiResp = {
  input?: { serial: string; model: string | null; equipmentType: string | null };
  parsed?: { inferredCue: string | null; family: string | null; vinYear: number | null };
  plate?: { guidance: PlateTip[] };
  seriesExamples?: Series[];
  notes?: string[];
  error?: string;
};

const TYPES = [
  "Backhoe Loader",
  "Telehandler (Loadall)",
  "Excavator",
  "Skid Steer / CTL",
  "Wheel Loader",
  "Telescopic Wheel Loader",
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
    const res = await fetch("/api/jcb-lookup", {
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
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">JCB Serial Number Lookup</h1>
      
      <BrandHubBanner slug="jcb" brandName="JCB" />
      
      <p className="mt-2 text-slate-600">
        Enter a JCB serial/PIN (and optional model). We'll show plate/stamped-frame locations by family,
        infer the family from common JCB cues (3CX/4CX, Loadall 531-70/535-95/540-170, JS/220X, 150T/190T/3TS, 411/427/457, TM),
        and decode the model year only when a true 17-character PIN is detected.
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
            <label className="block text-sm font-medium mb-1">Serial / PIN</label>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 3CX A12345, 531-70, JS220, 220X, 150T, or a 17-char PIN" value={serial} onChange={(e) => setSerial(e.target.value)} required />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Use the machine identification plate; many JCBs also stamp the serial on the frame/chassis.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model (optional)</label>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 3CX, 4CX, 531-70, 535-95, 540-170, JS220, 220X, 150T, 3TS-8T, 427, TM320" value={model} onChange={(e) => setModel(e.target.value)} />
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
                  <div className="text-slate-500">Model year (PIN only)</div>
                  <div className="font-medium">{data.parsed?.vinYear ?? "—"}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find your plate</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ""}:</span> {t.location_notes}
                    </li>
                  )) : <li>Check the machine identification plate near the operator area or chassis; stamped frame serial is a common backup.</li>}
                </ul>
              </div>

              {data.seriesExamples?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.seriesExamples.map((s, i) => (<p key={i}>• {s.code}: {s.example_note}</p>))}
                </div>
              ) : null}

              {data.notes?.length ? (
                <div className="mt-2 text-xs text-slate-500 space-y-1">
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
                      JCB parts pricing
                    </div>
                  </a>
                  <a
                    href="/parts/construction-equipment-parts"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      JCB Parts
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
                <a className="underline" href="/bobcat-serial-number-lookup">Bobcat</a> ·{" "}
                <a className="underline" href="/unicarriers-serial-number-lookup">UniCarriers</a> ·{" "}
                <a className="underline" href="/jlg-serial-number-lookup">JLG</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
