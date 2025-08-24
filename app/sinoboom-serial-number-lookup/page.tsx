"use client";
import { useState } from "react";

type PlateTip = { 
  equipment_type: string; 
  series: string | null; 
  location_notes: string; 
};

type RangeRow = { 
  model_code: string; 
  serial_range: string; 
  notes: string | null 
};

type ApiResp = {
  input?: { serial: string; model: string | null };
  parsed?: { inferredCue: string | null; family: string | null };
  plate?: { guidance: PlateTip[] };
  serialRanges?: RangeRow[];
  notes?: string[];
  error?: string;
};

export default function Page() {
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true); 
    setData(null);
    
    try {
      const res = await fetch("/api/sinoboom-lookup", {
        method: "POST", 
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, model: model || undefined })
      });
      const json = await res.json(); 
      setData(json);
    } catch (error) {
      setData({ error: "Failed to process request" });
    }
    
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Sinoboom Serial Number Lookup
      </h1>
      <p className="mt-2 text-slate-600">
        Enter your serial and optional model (e.g., 1930SE, 1932ME, 2746E, TB20J Plus, AB16EJ Plus).
        We'll show where to find the nameplate and any known serial-range blocks for that model.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Serial</label>
            <input 
              className="w-full rounded-xl border px-3 py-2" 
              placeholder="e.g., 1930SE A12345, TB20J Plus 0XXXXX" 
              value={serial} 
              onChange={(e) => setSerial(e.target.value)} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Model (optional)</label>
            <input 
              className="w-full rounded-xl border px-3 py-2" 
              placeholder="1530SE, 1930SE, 1532ME, 1932ME, 2146E, 2746E, 3346E, 4047E, TB20J Plus, AB16EJ Plus" 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
            />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Manuals show a Decals/Nameplates section with the exact nameplate location.
            </p>
          </div>
        </div>
        <button 
          type="submit" 
          className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors" 
          disabled={loading}
        >
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
                  <div className="text-slate-500">Inferred model cue</div>
                  <div className="font-medium">{data.parsed?.inferredCue || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.family || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Known ranges</div>
                  <div className="font-medium">{data.serialRanges?.length ? data.serialRanges.length : "—"}</div>
                </div>
              </div>

              {data.serialRanges && data.serialRanges.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Published Serial Ranges</h3>
                  <div className="space-y-2">
                    {data.serialRanges.map((range, i) => (
                      <div key={i} className="rounded-xl bg-white p-3 border text-sm">
                        <div className="font-medium">{range.model_code}</div>
                        <div className="text-slate-600">{range.serial_range}</div>
                        {range.notes && <div className="text-xs text-slate-500 mt-1">{range.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">
                        {t.equipment_type}{t.series ? ` — ${t.series}` : ""}:
                      </span> {t.location_notes}
                    </li>
                  )) : (
                    <li>Use the machine nameplate to read the model and serial; record the serial exactly as shown.</li>
                  )}
                </ul>
              </div>

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n, i) => (<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {/* Related Resources Section */}
              <div className="mt-8 p-4 bg-white rounded-xl border">
                <h3 className="font-semibold mb-3 text-sm">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <a 
                    href="/safety" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Equipment Training</div>
                    <div className="text-slate-600">OSHA forklift certification and aerial platform safety training</div>
                  </a>
                  <a 
                    href="/quote" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Parts Quote</div>
                    <div className="text-slate-600">Get pricing for Sinoboom parts and components</div>
                  </a>
                  <a 
                    href="/parts" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Sinoboom Parts</div>
                    <div className="text-slate-600">Browse scissor and boom lift replacement parts</div>
                  </a>
                  <a 
                    href="/battery-chargers" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Battery Chargers</div>
                    <div className="text-slate-600">Chargers for electric scissor lifts and aerial equipment</div>
                  </a>
                </div>
              </div>

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline hover:text-blue-600" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/clark-serial-number-lookup">Clark</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/mitsubishi-serial-number-lookup">Mitsubishi</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/doosan-serial-number-lookup">Doosan</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/genie-serial-number-lookup">Genie</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/jlg-serial-number-lookup">JLG</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/jcb-serial-number-lookup">JCB</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/case-serial-number-lookup">CASE</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/xcmg-serial-number-lookup">XCMG</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/toro-serial-number-lookup">Toro</a>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
