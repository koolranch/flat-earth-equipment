"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Calendar, Tractor } from "lucide-react";

type PlateTip = { 
  equipment_type: string; 
  series: string | null; 
  location_notes: string; 
  source_url: string | null; 
};

type ApiResponse = {
  input?: { serial: string; cleaned: string; equipmentType: string | null; model: string | null };
  result?: { estimatedYear: number; method: string } | null;
  plate?: { guidance: PlateTip[]; note: string };
  disclaimer?: string;
  error?: string;
};

const TYPES = ["Skid Steer","Tractor","Track Loader","Excavator","Combine","Forage Harvester","Backhoe","Telehandler"];

export default function NewHollandLookupPage() {
  const [equipmentType, setEquipmentType] = useState<string>("Skid Steer");
  const [model, setModel] = useState<string>(""); // optional (e.g., L170, 5030, 7740, T8.350)
  const [serial, setSerial] = useState<string>("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "New Holland Serial Number Lookup",
    "description": "Free tool to lookup New Holland equipment serial numbers. Find plate locations and estimate year from model-specific ranges or prefix patterns.",
    "url": "https://www.flatearthequipment.com/new-holland-serial-number-lookup",
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
      const res = await fetch("/api/newholland-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, equipmentType, model: model || undefined })
      });
      const json = (await res.json()) as ApiResponse;
      console.log('New Holland API Response:', json);
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  const plateTips = useMemo(() => data?.plate?.guidance || [], [data]);

  return (
    <>
      <Script id="newholland-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">New Holland Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                New Holland Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                All equipment types with intelligent year estimation
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plate Location</h3>
                <p className="text-sm text-slate-600">Find your serial</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Serial Ranges</h3>
                <p className="text-sm text-slate-600">Model-specific</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Prefix Patterns</h3>
                <p className="text-sm text-slate-600">Year codes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Year Estimate</h3>
                <p className="text-sm text-slate-600">When available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your New Holland <strong>serial/PIN</strong>. We'll provide plate location tips and, when available, 
            estimate the build year from model-specific serial ranges or prefix patterns. For exact year, 
            use the product identification plate.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Serial Number Checker</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Type *</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={equipmentType} 
                  onChange={(e) => setEquipmentType(e.target.value)}
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Helps provide specific plate location guidance
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model (optional)</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., L170, 5030, 7740, T8.350"
                  value={model}
                  onChange={(e) => setModel(e.target.value.trim())}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Adding a model lets us use known ranges/prefixes for a year estimate
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial / PIN *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the full serial as printed on the plate"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter exactly as shown on your product identification plate
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
                  Checking serial...
                </span>
              ) : (
                "Check Serial Number"
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
                      Serial Processed Successfully
                    </h3>
                    <p className="text-slate-600">
                      Serial: {data.input?.cleaned} · Equipment: {data.input?.equipmentType}
                      {data.input?.model && ` · Model: ${data.input.model}`}
                    </p>
                  </div>
                </div>

                {/* Year Estimate */}
                {console.log('data.result:', data.result)}
                {data.result ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Year Estimate Found</h4>
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      Estimated Year: {data.result.estimatedYear}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Method: {data.result.method === 'prefix_pattern' ? 'Prefix Pattern' : 'Serial Range'} · Always verify with plate date
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-slate-900">No Year Estimate Available</h4>
                    </div>
                    <p className="text-slate-700 text-sm">
                      No year estimate for this model/serial combination. Please use the year printed on your 
                      product identification plate or check with a dealer.
                    </p>
                  </div>
                )}

                {/* Plate Guidance */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Where to Find Your Plate/Serial</h4>
                  
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
                            <div className="font-medium text-slate-900">
                              {tip.series ? `${tip.series} — ` : ""}
                              {tip.equipment_type}
                            </div>
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
                          Check the data plate on the frame/hood/upperstructure; location varies by equipment type/series.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts/construction-equipment-parts"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Find Parts for This Model
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Equipment Types Supported</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <Tractor className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Tractors:</strong> PowerStar, T8 Series with prefix patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <Tractor className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Skid Steers:</strong> L/LS Series with serial ranges</span>
              </li>
              <li className="flex items-start gap-2">
                <Tractor className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Combines:</strong> CR/CX Series</span>
              </li>
              <li className="flex items-start gap-2">
                <Tractor className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>Others:</strong> Excavators, Track Loaders, Telehandlers, etc.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Year Estimation Methods</h2>
            <div className="space-y-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Prefix Patterns:</strong> T8 tractors use year-coded prefixes
                <br />Example: ZER = 2015, ZFR = 2016
              </div>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Serial Ranges:</strong> L170 skid steers and older tractors
                <br />Example: N4M460001-N4M460999 = 2004
              </div>
            </div>
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
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/parts/construction-equipment-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">New Holland Parts</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of New Holland parts by model and equipment type.
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
                  Need specific New Holland parts? Get a fast, accurate quote from our parts experts.
                </p>
              </div>
            </Link>
            
            <Link href="/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Skid Steer Guide</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Detailed guide for finding and using New Holland skid steer serial numbers.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
