"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Calendar, Truck } from "lucide-react";

type PlateTip = { 
  truck_family: string; 
  location_notes: string; 
  source_url: string | null; 
};

type ApiResponse = {
  input?: { serial: string; truckFamily: string | null; seriesOrModel: string | null };
  parsed?: { modelCode: string; yearTwoDigits: string; sequence: string };
  year?: { candidates: number[]; legacyMatch: { estimatedYear: number; method: string } | null };
  plate?: { guidance: PlateTip[]; note: string };
  disclaimer?: string;
  error?: string;
};

const FAMILIES = ["Reach / Orderpicker","Stand-up Counterbalance","Pallet Jack","Any (fallback)"];

export default function RaymondLookupPage() {
  const [truckFamily, setTruckFamily] = useState<string>("Reach / Orderpicker");
  const [serial, setSerial] = useState<string>("");
  const [seriesOrModel, setSeriesOrModel] = useState<string>(""); // optional: e.g., "010 Walkies", "812 (020)"
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Raymond Forklift Serial Number Lookup",
    "description": "Free tool to decode Raymond forklift serial numbers. Parse model digits, two-digit year code, and sequence. Get plate location tips.",
    "url": "https://www.flatearthequipment.com/raymond-serial-number-lookup",
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
      "url": "https://www.flatearthequipment.com"
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setData(null);
    
    try {
      const res = await fetch("/api/raymond-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, truckFamily, seriesOrModel: seriesOrModel || undefined })
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
      <Script id="raymond-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Raymond Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Raymond Forklift Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Decode model digits, two-digit year code, and sequence
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Model Code</h3>
                <p className="text-sm text-slate-600">First 3 digits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Year Code</h3>
                <p className="text-sm text-slate-600">2-digit year</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Sequence</h3>
                <p className="text-sm text-slate-600">Production #</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plate Tips</h3>
                <p className="text-sm text-slate-600">Location guide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your Raymond <strong>serial exactly as printed</strong> on the specification tag. 
            We'll parse the model digits, two-digit year code, and sequence. 
            For older series with published ranges, we'll estimate the year directly.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Serial Number Decoder</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Truck Family *</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={truckFamily} 
                  onChange={(e) => setTruckFamily(e.target.value)}
                >
                  {FAMILIES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Helps provide specific plate location guidance
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Legacy Series/Model (optional)</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder='e.g., "010 Walkies", "812 (020)"'
                  value={seriesOrModel}
                  onChange={(e) => setSeriesOrModel(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">If provided and we have ranges, we'll show an estimated year.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 020-77-11818"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Post-1977: first 3 digits = model · digits 4–5 = two-digit year · remaining = sequence.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Decoding serial...
                </span>
              ) : (
                "Decode Serial Number"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {data && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
            {data.error ? (
              <div className="flex items-start gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Error</h3>
                  <p>{data.error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Serial Decoded Successfully
                    </h3>
                    <p className="text-slate-600">
                      Family: {data.input?.truckFamily}
                      {data.input?.seriesOrModel && ` · Series: ${data.input.seriesOrModel}`}
                    </p>
                  </div>
                </div>

                {/* Decoded Parts */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Decoded Parts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <div className="text-slate-500 font-medium">Model Code (first 3 digits)</div>
                      </div>
                      <div className="font-bold text-2xl">{data.parsed?.modelCode || "—"}</div>
                    </div>
                    
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <div className="text-slate-500 font-medium">Two-Digit Year</div>
                      </div>
                      <div className="font-bold text-2xl">{data.parsed?.yearTwoDigits || "—"}</div>
                    </div>
                    
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-purple-600" />
                        <div className="text-slate-500 font-medium">Sequence</div>
                      </div>
                      <div className="font-bold text-lg">{data.parsed?.sequence || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Year Candidates */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Year Candidates</h4>
                  {data.year?.legacyMatch ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-slate-900">Legacy Year Estimate Found</h5>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        Estimated Year: {data.year.legacyMatch.estimatedYear}
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        Method: {data.year.legacyMatch.method} · Always verify with nameplate
                      </div>
                    </div>
                  ) : data.year?.candidates?.length ? (
                    <div>
                      <p className="text-sm text-slate-700 mb-3">
                        Based on the two-digit year <strong>{data.parsed?.yearTwoDigits}</strong>, possible years:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data.year.candidates.map((y) => (
                          <span key={y} className="px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-sm font-medium text-blue-800">
                            {y}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Choose decade using model documentation, equipment age, or dealer records.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">Couldn't infer year. Use the nameplate date or dealer records.</p>
                    </div>
                  )}
                </div>

                {/* Plate Location Guide */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Where to Find Your Serial</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 font-medium">
                      {data.plate?.note}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {plateTips.length ? (
                      plateTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-slate-900">{tip.truck_family}</div>
                            <div className="text-sm text-slate-700">{tip.location_notes}</div>
                            {tip.source_url && (
                              <a 
                                className="text-xs text-blue-600 underline hover:text-blue-800" 
                                href={tip.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Reference
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-700">
                          Check the specification/nameplate near the operator platform. If missing, look for a chassis stamp under the controller.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts/forklift-parts"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Find Raymond Parts
                  </Link>
                  <Link 
                    href="/quote"
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                  >
                    Get Parts Quote
                  </Link>
                </div>

                {/* Disclaimer */}
                {data.disclaimer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600">{data.disclaimer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Raymond Serial Format</h2>
            <div className="space-y-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Post-1977:</strong> Model(3 digits) + Year(2 digits) + Sequence
                <br />Example: 020-77-11818 → Model 020, Year 77 (1977), Sequence 11818
              </div>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Year Mapping:</strong> 77–99 → 1977–1999; 00–29 → 2000–2029
                <br />Use context (model docs, equipment age) to choose decade
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Common Model Codes</h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>020:</strong> Popular reach truck series</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>010:</strong> Walkie series (historic)</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>7XX:</strong> Modern 7400-series reach trucks</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>5XX:</strong> Order picker series (5200/5400/5600)</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Cross-links to other tools */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="bg-slate-600 p-2 rounded-lg flex-shrink-0">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">🔍 Other Equipment Lookups</h3>
              <p className="text-slate-700 mb-4">
                We have specialized lookup tools for other major equipment brands with brand-specific decoding.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/toyota-forklift-serial-lookup"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  <Search className="h-4 w-4" />
                  Toyota Forklifts
                </Link>
                <Link 
                  href="/hyster-serial-number-lookup"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  <Search className="h-4 w-4" />
                  Hyster Forklifts
                </Link>
                <Link 
                  href="/yale-serial-number-lookup"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Search className="h-4 w-4" />
                  Yale Forklifts
                </Link>
                <Link 
                  href="/bobcat-serial-number-lookup"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  <Search className="h-4 w-4" />
                  Bobcat Equipment
                </Link>
                <Link 
                  href="/new-holland-serial-number-lookup"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Search className="h-4 w-4" />
                  New Holland Equipment
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/parts/forklift-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Raymond Forklift Parts</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of Raymond forklift parts by model and serial number.
                </p>
              </div>
            </Link>
            
            <Link href="/quote" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-green-600">Get Parts Quote</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Need specific Raymond parts? Get a fast, accurate quote from our parts experts.
                </p>
              </div>
            </Link>
            
            <Link href="/safety/forklift" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Forklift Training</h3>
                </div>
                <p className="text-sm text-slate-600">
                  OSHA-compliant forklift operator training and certification programs.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
