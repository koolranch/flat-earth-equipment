"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, MapPin, Wrench, Settings, Calendar, Info, ExternalLink, Building2 } from "lucide-react";
import BrandHubBanner from '@/components/brand/BrandHubBanner';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';

type ApiResponse = {
  input?: { serial: string; model: string | null; equipmentType: string | null };
  decoded?: {
    manufacturer: string | null;
    productLine: string | null;
    yearCode: string | null;
    yearValue: number | null;
    plantCode: string | null;
    plantName: string | null;
    sequenceNumber: string | null;
    era: string | null;
    prefix: string | null;
  };
  plateLocations?: string[];
  officialLookupUrl?: string;
  notes?: string[];
  error?: string;
};

const EQUIPMENT_TYPES = [
  "Backhoe Loader (580 Series)",
  "Skid Steer Loader",
  "Compact Track Loader",
  "Excavator (CX Series)",
  "Wheel Loader",
  "Dozer (Crawler)",
  "Telehandler",
  "Compaction Equipment",
  "Tractor (Case IH)",
  "Other/Unknown"
];

export default function CaseSerialLookupPage() {
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) {
      setResult({ error: "Please enter a serial number or VIN" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      (window as any).va?.("serial_submit", { brand: "case", serial: serial.slice(0, 6) });
    } catch {}
    try {
      const res = await fetch("/api/case-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serial: serial.trim(), 
          model: model.trim() || null,
          equipmentType: equipmentType || null
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to decode serial number. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const brand = { slug: 'case-construction', name: 'Case Construction' };
  const url = 'https://flatearthequipment.com/case-serial-number-lookup';

  return (
    <>
      <SerialToolJsonLd brand={brand} url={url} />
      <Script
        id="case-serial-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Case Construction Serial Number Lookup",
            description: "Free tool to decode Case Construction Equipment serial numbers and VINs. Identify year of manufacture, plant location, and equipment specifications.",
            url,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: {
              "@type": "Organization",
              name: "Flat Earth Equipment",
              url: "https://flatearthequipment.com",
            },
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 text-white py-16">
          <div className="absolute inset-0 bg-[url('/images/case-pattern.svg')] opacity-5"></div>
          <div className="max-w-4xl mx-auto px-4 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Search className="w-8 h-8 text-yellow-300" />
              </div>
              <span className="text-yellow-300 font-medium tracking-wide uppercase text-sm">Free Decoder Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Case Construction Serial Number Lookup
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl leading-relaxed">
              Decode your Case backhoe, excavator, skid steer, or loader VIN/PIN to find the year of manufacture, plant location, and equipment specifications.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          {/* Decoder Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="serial" className="block text-sm font-semibold text-slate-700 mb-2">
                  Serial Number / VIN / PIN *
                </label>
                <input
                  type="text"
                  id="serial"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value.toUpperCase())}
                  placeholder="e.g., YDH214CJP7113456 or N5C400123"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition font-mono text-lg"
                  required
                />
                <p className="text-sm text-slate-500 mt-2">
                  Enter the 17-character VIN/PIN or older-style serial number from your data plate
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="model" className="block text-sm font-semibold text-slate-700 mb-2">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value.toUpperCase())}
                    placeholder="e.g., 580 Super M, CX240, SR270"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition"
                  />
                </div>
                <div>
                  <label htmlFor="equipmentType" className="block text-sm font-semibold text-slate-700 mb-2">
                    Equipment Type (Optional)
                  </label>
                  <select
                    id="equipmentType"
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition bg-white"
                  >
                    <option value="">Select type...</option>
                    {EQUIPMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-yellow-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Decoding...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Decode Serial Number
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
              {result.error ? (
                <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-xl">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{result.error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Serial Number Decoded Successfully</span>
                  </div>

                  {/* Input Summary */}
                  {result.input && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-700 mb-2">Input</h3>
                      <p className="font-mono text-lg">{result.input.serial}</p>
                      {result.input.model && <p className="text-slate-600">Model: {result.input.model}</p>}
                    </div>
                  )}

                  {/* Decoded Information */}
                  {result.decoded && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.decoded.manufacturer && (
                        <div className="bg-amber-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-amber-700 mb-1">
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Manufacturer</span>
                          </div>
                          <p className="text-xl font-bold text-amber-900">{result.decoded.manufacturer}</p>
                        </div>
                      )}

                      {result.decoded.yearValue && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-blue-700 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Year of Manufacture</span>
                          </div>
                          <p className="text-xl font-bold text-blue-900">{result.decoded.yearValue}</p>
                          {result.decoded.yearCode && (
                            <p className="text-sm text-blue-600">Code: {result.decoded.yearCode}</p>
                          )}
                        </div>
                      )}

                      {result.decoded.plantName && (
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">Manufacturing Plant</span>
                          </div>
                          <p className="text-xl font-bold text-green-900">{result.decoded.plantName}</p>
                          {result.decoded.plantCode && (
                            <p className="text-sm text-green-600">Code: {result.decoded.plantCode}</p>
                          )}
                        </div>
                      )}

                      {result.decoded.productLine && (
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-purple-700 mb-1">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">Product Line</span>
                          </div>
                          <p className="text-xl font-bold text-purple-900">{result.decoded.productLine}</p>
                        </div>
                      )}

                      {result.decoded.sequenceNumber && (
                        <div className="bg-slate-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-slate-700 mb-1">
                            <Wrench className="w-4 h-4" />
                            <span className="text-sm font-medium">Production Sequence</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 font-mono">{result.decoded.sequenceNumber}</p>
                        </div>
                      )}

                      {result.decoded.era && (
                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-orange-700 mb-1">
                            <Info className="w-4 h-4" />
                            <span className="text-sm font-medium">Production Era</span>
                          </div>
                          <p className="text-xl font-bold text-orange-900">{result.decoded.era}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Serial Plate Locations */}
                  {result.plateLocations && result.plateLocations.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Where to Find Your Serial Number
                      </h3>
                      <ul className="space-y-2">
                        {result.plateLocations.map((loc, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600">
                            <span className="text-amber-500 mt-1">•</span>
                            {loc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {result.notes && result.notes.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Additional Information
                      </h3>
                      <ul className="space-y-2">
                        {result.notes.map((note, i) => (
                          <li key={i} className="text-blue-700">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Official Lookup Link */}
                  {result.officialLookupUrl && (
                    <a
                      href={result.officialLookupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-amber-700 transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Visit Official CASE Parts Lookup
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">How Case Serial Numbers Work</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-amber-800 mb-2">Modern VIN/PIN Format (17 Characters)</h3>
                <p className="text-slate-600 mb-4">
                  Modern Case Construction equipment uses a standardized 17-character Vehicle Identification Number (VIN) or Product Identification Number (PIN):
                </p>
                <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="pb-2">Position</th>
                        <th className="pb-2">Meaning</th>
                        <th className="pb-2">Example</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr><td className="py-1">1-3</td><td>Manufacturer (CNH/Case)</td><td>YDH</td></tr>
                      <tr><td className="py-1">4-8</td><td>Equipment Descriptor</td><td>214CJ</td></tr>
                      <tr><td className="py-1">9</td><td>Check Digit</td><td>X</td></tr>
                      <tr><td className="py-1">10</td><td>Year Code</td><td>P = 2023</td></tr>
                      <tr><td className="py-1">11</td><td>Plant Code</td><td>J = Japan</td></tr>
                      <tr><td className="py-1">12-17</td><td>Sequential Number</td><td>113456</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-amber-800 mb-2">Legacy Serial Prefixes</h3>
                <p className="text-slate-600 mb-4">
                  Older Case and Case IH equipment uses prefix-based serial numbers:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="font-semibold text-amber-900">JJE</p>
                    <p className="text-sm text-amber-700">CX/Maxxum Series (Late 1990s–2000s)</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="font-semibold text-amber-900">JJF</p>
                    <p className="text-sm text-amber-700">5100–5200 Series (Early 1990s)</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="font-semibold text-amber-900">JJA</p>
                    <p className="text-sm text-amber-700">Magnum Series (Late 1980s–1990s)</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="font-semibold text-amber-900">N5C</p>
                    <p className="text-sm text-amber-700">2005 Production Year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Serial Plate Locations */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Where to Find Your Case Serial Number</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Backhoe Loaders</h3>
                    <p className="text-slate-600 text-sm">Near the front axle beam or riveted to the front bolster</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Excavators</h3>
                    <p className="text-slate-600 text-sm">Right side of main body near the operator&apos;s cab or behind the boom cylinder</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Skid Steer Loaders</h3>
                    <p className="text-slate-600 text-sm">Inside the cab door frame or on the left lift arm plate</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Wheel Loaders</h3>
                    <p className="text-slate-600 text-sm">On the chassis frame near the transmission crossmember</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Dozers</h3>
                    <p className="text-slate-600 text-sm">Front frame near the hydraulic pump or rear cross member</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Tractors</h3>
                    <p className="text-slate-600 text-sm">Below the steering column or on the right-hand side of the chassis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Hub Banner */}
          <BrandHubBanner slug="case-construction" name="Case Construction" />

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Need Case Parts?</h2>
            <p className="text-amber-100 mb-6 max-w-lg mx-auto">
              Flat Earth Equipment stocks genuine and aftermarket Case parts for backhoes, excavators, skid steers, and more. Get the right parts for your machine.
            </p>
            <Link
              href="/brand/case-construction/serial-lookup#parts-request"
              className="inline-flex items-center gap-2 bg-white text-amber-700 py-3 px-6 rounded-xl font-bold hover:bg-amber-50 transition"
            >
              Request Parts Quote
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
