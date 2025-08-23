"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Calendar, Truck } from "lucide-react";

type PlateTip = { 
  equipment_type: string; 
  series: string | null; 
  location_notes: string; 
  source_url: string | null; 
};

type ModuleHit = { 
  module_code: string; 
  likely_model: string | null; 
  engine: string | null; 
  notes: string | null; 
  source_url: string | null; 
};

type ApiResponse = {
  input?: { serial: string; equipmentType: string | null; model: string | null };
  modules?: { moduleCode: string; productionSequence: string; moduleDictionaryHit: ModuleHit | null };
  plate?: { guidance: PlateTip[]; note: string };
  legacyYear?: { estimatedYear: number; method: string } | null;
  disclaimer?: string;
  error?: string;
};

const EQUIPMENT_TYPES = ["Loader", "Track Loader", "Excavator", "Mini Track Loader"];

export default function BobcatLookupPage() {
  const [equipmentType, setEquipmentType] = useState<string>("Loader");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState(""); // optional (e.g., 843)
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Bobcat Serial Number Lookup",
    "description": "Free tool to decode Bobcat equipment serial numbers. Identifies module code, production sequence, and provides plate location guidance for all equipment types.",
    "url": "https://www.flatearthequipment.com/bobcat-serial-number-lookup",
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
      const res = await fetch("/api/bobcat-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, equipmentType, model: model || undefined })
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
      <Script id="bobcat-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Bobcat Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Bobcat Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Universal decoder for all Bobcat equipment types
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Module Code</h3>
                <p className="text-sm text-slate-600">First 4 digits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Production Seq</h3>
                <p className="text-sm text-slate-600">Last 5 digits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plate Location</h3>
                <p className="text-sm text-slate-600">Where to find it</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Legacy Years</h3>
                <p className="text-sm text-slate-600">Select models</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your <strong>Bobcat serial number</strong> to decode the module (first 4 digits) and production sequence (last 5 digits). 
            Model year is printed on the plate; for some older models we can estimate the year using public ranges.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Serial Number Decoder</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Type *</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Helps provide specific plate location guidance
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Legacy Model (optional)</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., 843, S650"
                  value={model}
                  onChange={(e) => setModel(e.target.value.trim())}
                />
                <p className="mt-1 text-xs text-slate-500">
                  If provided and we have public ranges, we'll estimate the year
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Expect 9 digits (4+5), e.g., 1234 06789"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Year is not encoded in digits; use the plate date for the official year
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
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
                      Serial: {data.input?.serial} · Equipment: {data.input?.equipmentType}
                      {data.input?.model && ` · Model: ${data.input.model}`}
                    </p>
                  </div>
                </div>

                {/* Decoded Parts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-slate-900">Module (first 4 digits)</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{data.modules?.moduleCode}</div>
                    {data.modules?.moduleDictionaryHit && (
                      <div className="text-sm text-slate-600 mt-1">
                        <div>Model: {data.modules.moduleDictionaryHit.likely_model}</div>
                        {data.modules.moduleDictionaryHit.engine && (
                          <div>Engine: {data.modules.moduleDictionaryHit.engine}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-slate-900">Production Sequence (last 5)</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{data.modules?.productionSequence}</div>
                    <div className="text-sm text-slate-600 mt-1">Manufacturing sequence number</div>
                  </div>
                </div>

                {/* Legacy Year */}
                {data.legacyYear && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Legacy Year Estimate</h4>
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      Estimated Year: {data.legacyYear.estimatedYear}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Method: {data.legacyYear.method} · Always verify with plate date
                    </div>
                  </div>
                )}

                {/* Plate Guidance */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Where to Find Your Serial and Year</h4>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
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
                          Plate is typically on the frame or upperstructure; check near cab door, rear frame, 
                          or track area depending on equipment type.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts/construction-equipment-parts"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Serial Number Format</h2>
            <div className="space-y-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Format:</strong> XXXX XXXXX (9 digits total)
                <br />• First 4 digits = Module code (model/engine)
                <br />• Last 5 digits = Production sequence
              </div>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Example:</strong> 5150 12345
                <br />• 5150 = S650 model module
                <br />• 12345 = Production sequence
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Equipment Types Supported</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>Loaders:</strong> R-Series, M-Series, Classic models</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>Track Loaders:</strong> T-Series compact track loaders</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>Excavators:</strong> Mini and compact excavators</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>Mini Track Loaders:</strong> Compact models</span>
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
                We also have dedicated lookup tools for other equipment brands with specialized decoding.
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
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/parts/construction-equipment-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-red-300">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-red-600">Bobcat Parts</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of Bobcat parts by model and equipment type.
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
                  Need specific Bobcat parts? Get a fast, accurate quote from our parts experts.
                </p>
              </div>
            </Link>
            
            <Link href="/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Complete Guide</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Step-by-step instructions for finding and using your Bobcat serial number.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
