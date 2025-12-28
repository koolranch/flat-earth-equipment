"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, MapPin, Wrench, Settings, Calendar, Info, ExternalLink } from "lucide-react";
import BrandHubBanner from '@/components/brand/BrandHubBanner';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';

type ApiResponse = {
  input?: { serial: string; model: string | null; equipmentType: string | null };
  decoded?: {
    equipmentFamily: string | null;
    modelDetails: { platformHeight: number; width: number } | null;
    designRevision: string | null;
    sequenceNumber: string | null;
    prefix: string | null;
  };
  plateLocations?: string[];
  officialLookupUrl?: string;
  notes?: string[];
  error?: string;
};

const EQUIPMENT_TYPES = [
  "Scissor Lift (GS Series)",
  "Telescopic Boom (S Series)",
  "Articulating Boom (Z Series)",
  "Telehandler (GTH Series)",
  "Push-Around (AWP/IWP)",
  "Trailer Boom (TZ Series)",
  "Any / Unknown"
];

export default function GenieLookupPage() {
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [equipmentType, setEquipmentType] = useState("Any / Unknown");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Genie Aerial Lift Serial Number Lookup",
    "description": "Free tool to decode Genie aerial lift serial numbers. Identifies equipment type, model specifications, and serial plate locations.",
    "url": "https://flatearthequipment.com/genie-serial-number-lookup",
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
      const res = await fetch("/api/genie-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serial,
          model: model || undefined,
          equipmentType: equipmentType === "Any / Unknown" ? undefined : equipmentType
        })
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SerialToolJsonLd 
        name="Genie Aerial Lift Serial Number Lookup" 
        url="/genie-serial-number-lookup" 
      />
      <Script id="genie-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <Link href="/brand/genie" className="hover:text-slate-900">Genie</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Genie Serial Number Lookup
              </h1>
              <p className="text-lg text-slate-600">
                Decode your Genie aerial lift, scissor lift, or boom lift serial number
              </p>
            </div>
          </div>

          <BrandHubBanner slug="genie" name="Genie" />

          <p className="text-slate-700 leading-relaxed">
            Enter your Genie serial number to decode equipment type, model specifications, and find where the serial plate 
            is located on your machine. Genie uses model-based serial formats (e.g., <code className="bg-white px-1.5 py-0.5 rounded text-sm">GS3205A-76000</code>) 
            where the prefix identifies the model series.
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Type</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Helps narrow down serial plate location
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model (optional)</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., GS-1930, S-60, Z-45/25"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Model numbers like GS-1930: 19' height, 30" width
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., GS3205A-76000, S4012D-15673"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter complete serial number from the data plate
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
              <div className="text-red-600 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p>{data.error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-900">Decoded Results</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Equipment Type</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {data.decoded?.equipmentFamily || "Unknown"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Prefix Code</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {data.decoded?.prefix || "—"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Design Revision</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {data.decoded?.designRevision || "—"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Sequence #</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {data.decoded?.sequenceNumber || "—"}
                    </p>
                  </div>
                </div>

                {/* Model Details */}
                {data.decoded?.modelDetails && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Model Specifications</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Platform Height:</span>
                        <span className="ml-2 font-bold text-blue-900">{data.decoded.modelDetails.platformHeight}' ({Math.round(data.decoded.modelDetails.platformHeight * 0.3048)}m)</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Machine Width:</span>
                        <span className="ml-2 font-bold text-blue-900">{data.decoded.modelDetails.width}" ({Math.round(data.decoded.modelDetails.width * 2.54)}cm)</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Working height is approximately {data.decoded.modelDetails.platformHeight + 6}' (platform height + 6')
                    </p>
                  </div>
                )}

                {/* Plate Locations */}
                {data.plateLocations && data.plateLocations.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-slate-700" />
                      <h4 className="font-semibold text-slate-900">Serial Plate Locations</h4>
                    </div>
                    <ul className="space-y-2">
                      {data.plateLocations.map((loc, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{loc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Official Lookup Link */}
                {data.officialLookupUrl && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-amber-900 mb-2">Need More Details?</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      For official parts diagrams and year confirmation, use Genie's Smart Parts system:
                    </p>
                    <a 
                      href={data.officialLookupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Genie Smart Parts Lookup
                    </a>
                  </div>
                )}

                {/* Notes */}
                {data.notes && data.notes.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-medium text-slate-700 mb-2">Notes:</h4>
                    <ul className="space-y-1">
                      {data.notes.map((note, i) => (
                        <li key={i} className="text-sm text-slate-600">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                      <p className="text-sm text-slate-600 mt-1">Fast quotes for Genie parts</p>
                    </Link>
                    
                    <Link href="/parts" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                      <div className="text-2xl mb-2">🔧</div>
                      <h4 className="font-medium text-slate-900 group-hover:text-black">Genie Parts</h4>
                      <p className="text-sm text-slate-600 mt-1">Genuine and aftermarket parts</p>
                    </Link>

                    <Link href="/brand/genie/fault-codes" className="group block p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors bg-white hover:bg-slate-50">
                      <div className="text-2xl mb-2">⚠️</div>
                      <h4 className="font-medium text-slate-900 group-hover:text-black">Genie Fault Codes</h4>
                      <p className="text-sm text-slate-600 mt-1">Troubleshoot error codes</p>
                    </Link>
                  </div>
                </div>

                {/* More lookups section */}
                <section className="mt-8 text-sm text-slate-600">
                  More lookups:{" "}
                  <a className="underline" href="/toyota-forklift-serial-lookup">Toyota</a> ·{" "}
                  <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                  <a className="underline" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                  <a className="underline" href="/jlg-serial-number-lookup">JLG</a> ·{" "}
                  <a className="underline" href="/bobcat-serial-number-lookup">Bobcat</a> ·{" "}
                  <a className="underline" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                  <a className="underline" href="/skyjack-serial-number-lookup">Skyjack</a>
                </section>
              </>
            )}
          </div>
        )}

        {/* Educational Content */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Understanding Genie Serial Numbers</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Model Number Format</h3>
              <p className="text-slate-700 mb-3">
                Genie model numbers encode key specifications. For example, <strong>GS-1930</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li><strong>GS</strong> = Genie Scissor series</li>
                <li><strong>19</strong> = 19-foot platform height</li>
                <li><strong>30</strong> = 30-inch machine width</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Serial Number Format</h3>
              <p className="text-slate-700 mb-3">
                Example: <code className="bg-slate-100 px-2 py-0.5 rounded">GS3205A-76000</code>
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li><strong>GS3205</strong> = Model-specific prefix code</li>
                <li><strong>A</strong> = Design revision letter (A, B, C indicate manufacturing updates)</li>
                <li><strong>76000</strong> = Sequential production number</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Equipment Series</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900">GS Series</h4>
                  <p className="text-sm text-slate-600">Scissor lifts (GS-1930, GS-2632, GS-3246)</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900">S Series</h4>
                  <p className="text-sm text-slate-600">Telescopic booms (S-40, S-60, S-80)</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900">Z Series</h4>
                  <p className="text-sm text-slate-600">Articulating booms (Z-45/25, Z-60/34)</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900">GTH Series</h4>
                  <p className="text-sm text-slate-600">Telehandlers (GTH-5519, GTH-636)</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Year Identification</h3>
              <p className="text-blue-800 text-sm">
                Unlike some manufacturers, Genie does not directly encode the year in the serial number. 
                Year of manufacture is typically determined by serial number ranges documented in Genie's 
                service manuals or through their official Smart Parts lookup system.
              </p>
            </div>
          </div>
        </div>

        {/* Serial Plate Locations */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Where to Find Your Serial Number</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Scissor Lifts (GS Series)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Front frame member near the battery</li>
                <li>Under the platform (base frame)</li>
                <li>Near the operator controls</li>
              </ul>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Boom Lifts (S/Z Series)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Above the battery compartment</li>
                <li>On the turntable bearing housing</li>
                <li>Stamped on frame rails (L/R and R/F of plate)</li>
              </ul>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Telehandlers (GTH Series)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>On the main frame near the cab</li>
                <li>Inside the operator cab</li>
                <li>Engine compartment area</li>
              </ul>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Push-Around Lifts (AWP/IWP)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>On the mast or base frame</li>
                <li>Near the control panel</li>
                <li>On the battery cover area</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Pro Tip:</strong> If the serial plate is missing or damaged, check for stamped numbers 
              on the frame. Genie typically stamps the serial number directly into the metal as a backup.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

