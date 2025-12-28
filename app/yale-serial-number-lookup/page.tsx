"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Calendar, Truck } from "lucide-react";

type Plant = { 
  code: string; 
  name: string | null; 
  city: string | null; 
  state_province: string | null; 
  country: string | null; 
  notes: string | null; 
};

type Prefix = { 
  prefix: string; 
  family: string | null; 
  marketed_model: string | null; 
  notes: string | null; 
};

type ApiResponse = {
  input?: { serial: string; cleaned: string };
  parts?: { prefix: string; plantCode: string; productionSequence: string; yearLetter: string | null };
  plant?: Plant | null;
  modelPrefix?: Prefix | null;
  yearCandidates?: number[];
  disclaimer?: string;
  error?: string;
};

export default function YaleLookupPage() {
  const [serial, setSerial] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Yale Forklift Serial Number Lookup",
    "description": "Free tool to decode Yale forklift serial numbers. Decode design/series prefix, plant code, production sequence, and year letter (post-1995).",
    "url": "https://flatearthequipment.com/yale-serial-number-lookup",
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
      const res = await fetch("/api/yale-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial })
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script id="yale-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Yale Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Yale Forklift Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Decode design/series, plant, and year letter (post-1995)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Design/Series</h3>
                <p className="text-sm text-slate-600">Model prefix</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plant Location</h3>
                <p className="text-sm text-slate-600">Manufacturing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Production #</h3>
                <p className="text-sm text-slate-600">Sequence</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Year Letter</h3>
                <p className="text-sm text-slate-600">Post-1995</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your Yale <strong>serial number</strong> to decode design/series, plant, and production sequence. 
            Post-1995 serials end with a year letter (I, O, Q skipped); the letter repeats ~every 23 years, 
            so pick the correct decade.
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., GLP050VX N 17543 S"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Tip: If your data plate shows a month/year, that's the official build date.
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
                      Serial: {data.input?.cleaned}
                    </p>
                  </div>
                </div>

                {/* Decoded Parts */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Decoded Parts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <div className="text-slate-500 font-medium">Design/Series Prefix</div>
                      </div>
                      <div className="font-bold text-lg">{data.parts?.prefix || "—"}</div>
                      {data.modelPrefix?.marketed_model && (
                        <div className="text-xs text-slate-600 mt-1">
                          Family: {data.modelPrefix.family || "—"} · Example model: {data.modelPrefix.marketed_model}
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div className="text-slate-500 font-medium">Plant</div>
                      </div>
                      <div className="font-bold text-lg">
                        {data.plant
                          ? `${data.plant.name || ""} (${data.plant.code})`
                          : data.parts?.plantCode || "—"}
                      </div>
                      {data.plant && (
                        <div className="text-xs text-slate-600 mt-1">
                          {[data.plant.city, data.plant.state_province, data.plant.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-purple-600" />
                        <div className="text-slate-500 font-medium">Production Sequence</div>
                      </div>
                      <div className="font-bold text-lg">{data.parts?.productionSequence || "—"}</div>
                    </div>
                    
                    <div className="rounded-xl bg-slate-50 p-4 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <div className="text-slate-500 font-medium">Year Letter</div>
                      </div>
                      <div className="font-bold text-lg">{data.parts?.yearLetter || "None detected"}</div>
                    </div>
                  </div>
                </div>

                {/* Year Candidates */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Year Candidates</h4>
                  {data.yearCandidates && data.yearCandidates.length ? (
                    <div>
                      <p className="text-sm text-slate-700 mb-3">
                        Based on the year letter <strong>{data.parts?.yearLetter}</strong>, possible years:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data.yearCandidates.map((y) => (
                          <span key={y} className="px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-sm font-medium text-blue-800">
                            {y}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        No year letter detected. This serial may be pre-1995 or nonstandard; year may not be encoded as a trailing letter. Check the data plate or dealer records.
                      </p>
                    </div>
                  )}
                  
                  {data.disclaimer && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-slate-600">{data.disclaimer}</p>
                    </div>
                  )}
                </div>

                {/* Serial Location Guide */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Where to Find Your Serial</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-900">Data Plate (Nameplate)</div>
                        <div className="text-sm text-slate-700">Often near the operator station/cab post on the truck</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
                      <Wrench className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-900">Frame Stamping</div>
                        <div className="text-sm text-slate-700">Common spots: right-hand frame near floor plate, step/hood seams</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts/forklift-parts"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Find Yale Parts
                  </Link>
                  <Link 
                    href="/quote"
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                  >
                    Get Parts Quote
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Yale Serial Format</h2>
            <div className="space-y-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Post-1995:</strong> [Design/Series][Plant][Sequence][Year Letter]
                <br />Example: GLP050VX N 17543 S
              </div>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Year Letters:</strong> S=1995, T=1996, ..., Z=2025, A=2026, etc.
                <br />Letters I, O, Q are skipped; repeats every ~23 years
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Key Plants</h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>N:</strong> Greenville, NC (Major US facility)</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>V:</strong> Berea, KY (Common Yale code)</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>R:</strong> Obu, Japan (OBU-SHI plant)</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>B:</strong> Craigavon, Northern Ireland</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/parts/forklift-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Yale Forklift Parts</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of Yale forklift parts by model and serial number.
                </p>
              </div>
            </Link>
            
            <Link href="/battery-chargers" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 w-5 text-orange-600">⚡</div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">Yale Battery Chargers</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Professional 24V-80V chargers compatible with Yale electric forklifts. Fast and overnight options.
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
                  Need specific Yale parts? Get a fast, accurate quote from our parts experts.
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
