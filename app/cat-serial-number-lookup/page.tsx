"use client";
import { useState, useMemo } from "react";
import Script from "next/script";

type PlateTip = { 
  equipment_type: string; 
  series: string | null; 
  location_notes: string; 
};

type ApiResponse = {
  input?: { 
    serial: string; 
    model: string | null; 
    equipmentType: string | null 
  };
  parsed?: { 
    inferredPrefix: string | null; 
    year: number | null 
  };
  plate?: { 
    guidance: PlateTip[] 
  };
  notes?: string[];
  error?: string;
};

const EQUIPMENT_TYPES = [
  "IC Pneumatic (GP/DP)",
  "Electric Cushion (EC)",
  "Electric Pneumatic (EP)",
  "Any"
];

export default function CATLookupPage() {
  const [equipmentType, setEquipmentType] = useState("Any");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CAT Forklift Serial Number Lookup",
    "description": "Find CAT (Caterpillar) capacity/data plate guidance and infer family (GP/DP/EC/EP). VIN-year decoding only for true 17-character VIN/PIN.",
    "url": "https://flatearthequipment.com/cat-serial-number-lookup",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "Flat Earth Equipment",
      "url": "https://flatearthequipment.com"
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setData(null);
    
    try {
      const res = await fetch("/api/cat-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serial,
          model: model || undefined,
          equipmentType: equipmentType === "Any" ? undefined : equipmentType
        })
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  const plateTips = useMemo(() => data?.plate?.guidance || [], [data]);

  return (
    <>
      <Script 
        id="cat-lookup-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            CAT Forklift Serial Number Lookup
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Enter a CAT serial/PIN and optional model. We'll show Capacity/Data Plate guidance by family,
            infer family from model prefixes (GP/DP/EC/EP), and decode the model year only when a true 17-character VIN/PIN is detected.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-6 space-y-6 bg-white rounded-2xl p-6 shadow-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Type
              </label>
              <select 
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={equipmentType} 
                onChange={(e) => setEquipmentType(e.target.value)}
              >
                {EQUIPMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial / PIN
              </label>
              <input 
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g., GP25N A12345, or 17-char VIN/PIN" 
                value={serial} 
                onChange={(e) => setSerial(e.target.value)} 
                required 
              />
              <p className="mt-2 text-xs text-slate-500">
                Tip: CAT's Capacity/Data Plate lists the truck serial; it's typically in the operator compartment/cowl area.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model (optional)
            </label>
            <input 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g., GP25N, DP40N, EC25N, EP25N" 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full md:w-auto rounded-2xl bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? "Checking…" : "Check Serial"}
          </button>
        </form>

        {/* Results */}
        {data && (
          <div className="mt-8 rounded-2xl border border-gray-200 p-6 bg-slate-50">
            {"error" in data && data.error ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-medium">Error: {data.error}</p>
              </div>
            ) : (
              <>
                {/* Parsed Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Decoded Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white p-4 border border-gray-200">
                      <div className="text-sm text-slate-500 mb-1">Inferred family</div>
                      <div className="font-medium text-gray-900">
                        {data.parsed?.inferredPrefix || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-gray-200">
                      <div className="text-sm text-slate-500 mb-1">Estimated year (VIN/PIN only)</div>
                      <div className="font-medium text-gray-900">
                        {data.parsed?.year ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plate Location Guidance */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Where to find your plate</h3>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <ul className="space-y-3">
                      {plateTips.length ? plateTips.map((tip, i) => (
                        <li key={i} className="flex">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <div>
                            <span className="font-medium text-gray-900">
                              {tip.equipment_type}
                              {tip.series ? ` — ${tip.series}` : ""}:
                            </span>
                            <span className="text-slate-700 ml-2">{tip.location_notes}</span>
                          </div>
                        </li>
                      )) : (
                        <li className="text-slate-700">
                          Check the Capacity/Data Plate and manufacturer name plate in the operator area.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Notes */}
                {data.notes?.length ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      {data.notes.map((note, i) => (
                        <p key={i} className="text-sm text-blue-800 mb-2 last:mb-0">
                          • {note}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Related Resources */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a 
                      href="/safety" 
                      className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="text-blue-600 mb-2">📚</div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">Forklift Training</div>
                      <div className="text-sm text-slate-600">OSHA-compliant certification</div>
                    </a>
                    
                    <a 
                      href="/quote" 
                      className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="text-green-600 mb-2">💰</div>
                      <div className="font-medium text-gray-900 group-hover:text-green-600">Get Parts Quote</div>
                      <div className="text-sm text-slate-600">Fast pricing on CAT parts</div>
                    </a>
                    
                    <a 
                      href="/parts" 
                      className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="text-orange-600 mb-2">🔧</div>
                      <div className="font-medium text-gray-900 group-hover:text-orange-600">CAT Parts</div>
                      <div className="text-sm text-slate-600">Browse replacement parts</div>
                    </a>

                    <a 
                      href="/battery-chargers" 
                      className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="text-yellow-600 mb-2">⚡</div>
                      <div className="font-medium text-gray-900 group-hover:text-yellow-600">CAT Battery Chargers</div>
                      <div className="text-sm text-slate-600">Find compatible chargers</div>
                    </a>
                  </div>
                </div>

                {/* Cross-brand Links */}
                <section className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-slate-600 mb-3">Looking up other brands?</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/toyota-forklift-serial-number-lookup">Toyota</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/hyster-serial-number-lookup">Hyster</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/yale-serial-number-lookup">Yale</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/raymond-serial-number-lookup">Raymond</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/genie-serial-number-lookup">Genie</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/bobcat-serial-number-lookup">Bobcat</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/clark-serial-number-lookup">Clark</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/crown-serial-number-lookup">Crown</a>
                    <a className="text-blue-600 hover:text-blue-800 text-sm font-medium underline" href="/komatsu-serial-number-lookup">Komatsu</a>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
