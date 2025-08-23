"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Calendar } from "lucide-react";

type ApiResponse = {
  input?: { serial: string; cleaned: string };
  parts?: { prefix: string; plantCode: string; sequence: string; yearLetter: string };
  plant?: { code: string; name: string; city: string; state_province: string; country: string; notes: string } | null;
  modelPrefix?: { prefix: string; series: string; marketed_model: string; notes: string } | null;
  yearCandidates?: number[];
  disclaimer?: string;
  error?: string;
};

const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960];

export default function HysterLookupPage() {
  const [serial, setSerial] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [decade, setDecade] = useState<number | null>(null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Hyster Forklift Serial Number Lookup",
    "description": "Free tool to decode Hyster forklift serial numbers. Identifies model prefix, manufacturing plant, and year candidates.",
    "url": "https://www.flatearthequipment.com/hyster-serial-number-lookup",
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
    setDecade(null);
    
    try {
      const res = await fetch("/api/hyster-lookup", {
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

  const filteredYears = useMemo(() => {
    if (!data?.yearCandidates) return [];
    if (!decade) return data.yearCandidates.slice(-6);
    return data.yearCandidates.filter((y) => Math.floor(y / 10) * 10 === decade);
  }, [data, decade]);

  return (
    <>
      <Script id="hyster-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Hyster Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Hyster Forklift Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Decode your Hyster serial number instantly
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Settings className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Model Prefix</h3>
                <p className="text-sm text-slate-600">Decode model family</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plant Location</h3>
                <p className="text-sm text-slate-600">Manufacturing facility</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Year Candidates</h3>
                <p className="text-sm text-slate-600">Possible build years</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your <strong>Hyster serial number</strong> to decode the model prefix, manufacturing plant, 
            and year candidates. Post-1957 format uses a 4-part structure with repeating year letters.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Serial Number Decoder</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., C187V07095P, A187N12345R"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter complete serial number including letters and numbers
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
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
                      Serial: {data.input?.cleaned} · Original: {data.input?.serial}
                    </p>
                  </div>
                </div>

                {/* Decoded Parts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-slate-900">Model Prefix</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{data.parts?.prefix}</div>
                    {data.modelPrefix && (
                      <div className="text-sm text-slate-600 mt-1">
                        <div>Series: {data.modelPrefix.series}</div>
                        <div>Example: {data.modelPrefix.marketed_model}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-slate-900">Manufacturing Plant</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {data.plant ? data.plant.name : data.parts?.plantCode} ({data.parts?.plantCode})
                    </div>
                    {data.plant && (
                      <div className="text-sm text-slate-600 mt-1">
                        {[data.plant.city, data.plant.state_province, data.plant.country]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Sequence Number</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{data.parts?.sequence}</div>
                    <div className="text-sm text-slate-600 mt-1">Production sequence</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-slate-900">Year Code</h4>
                    </div>
                    <div className="text-lg font-bold text-slate-900">{data.parts?.yearLetter}</div>
                    <div className="text-sm text-slate-600 mt-1">Repeats every ~23 years</div>
                  </div>
                </div>

                {/* Year Candidates */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Year Candidates</h4>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-slate-600 mr-2">Filter by decade:</span>
                    {DECADES.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDecade(d === decade ? null : d)}
                        className={`px-3 py-1 rounded-full border text-sm transition ${
                          d === decade 
                            ? "bg-orange-600 text-white border-orange-600" 
                            : "bg-white text-slate-700 border-slate-300 hover:border-orange-300"
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filteredYears.length > 0 ? (
                      filteredYears.map((y) => (
                        <span 
                          key={y} 
                          className="px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 font-medium"
                        >
                          {y}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 text-sm italic">
                        No matches for chosen decade; try another or view all years above.
                      </span>
                    )}
                  </div>
                  
                  {data.disclaimer && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">{data.disclaimer}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts/forklift-parts"
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
              </div>
            )}
          </div>
        )}

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Where to Find Your Serial Number</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Data Plate:</strong> Lists serial, model, and rated capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Frame Stamping:</strong> Near the mast or under the seat</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Owner's Manual:</strong> Lists original serial number</span>
              </li>
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About Hyster Serial Numbers</h2>
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>Format:</strong> [Model Prefix][Plant][Sequence][Year Letter]
              </p>
              <p>
                <strong>Year Letters:</strong> Cycle every ~23 years (I, O, Q skipped)
              </p>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <strong>Example:</strong> C187V07095P
                <br />• C187 = Model prefix
                <br />• V = Berea, Kentucky plant
                <br />• 07095 = Sequence number
                <br />• P = Year letter
              </div>
            </div>
          </section>
        </div>

        {/* Cross-link to Toyota */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="bg-red-600 p-2 rounded-lg flex-shrink-0">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">🚗 Looking up a Toyota instead?</h3>
              <p className="text-slate-700 mb-4">
                We also have a dedicated lookup tool for Toyota forklifts with year estimation 
                based on serial number ranges.
              </p>
              <Link 
                href="/toyota-forklift-serial-lookup"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                <Search className="h-4 w-4" />
                Try Toyota Serial Lookup
              </Link>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/parts/forklift-parts" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">Hyster Forklift Parts</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Browse our complete inventory of Hyster forklift parts by model and series.
                </p>
              </div>
            </Link>
            
            <Link href="/battery-chargers" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-orange-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 w-5 text-orange-600">⚡</div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">Hyster Battery Chargers</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Professional 24V-80V chargers compatible with Hyster electric forklifts. Fast and overnight options.
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
                  Need specific Hyster parts? Get a fast, accurate quote from our parts experts.
                </p>
              </div>
            </Link>
            
            <Link href="/safety/forklift" className="group">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 w-5 text-blue-600">🎓</div>
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
