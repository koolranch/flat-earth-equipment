"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle, MapPin, Wrench, Settings, Calendar, Info, ExternalLink, Building2 } from "lucide-react";
import BrandHubBanner from '@/components/brand/BrandHubBanner';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import BrandRubberTracksSection from '@/components/parts/BrandRubberTracksSection';

type PartFit = { slug: string; name: string; sales_type: string | null; price_cents: number | null; is_fast_moving: boolean | null };

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
  partsThatFit?: PartFit[];
  officialLookupUrl?: string;
  notes?: string[];
  error?: string;
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a Case 580 backhoe?",
    a: "On older 580B / 580C / 580D loader-backhoes the serial plate is on the left side of the dash, just inside the left cab door, or under the left door on the side of the frame rail. On 580E / 580K the serial is stamped on the top of the frame under the cab between the rear tire and fender. On modern 580M / 580 Super L / 580SM / 580SN / 580SNWT / 580 Super R units the PIN plate is on the left-hand side of the chassis beneath the loader-arm pivot.",
  },
  {
    q: "Where is the serial number on a Case skid steer or compact track loader (SR / SV / TR / TV)?",
    a: "On 2014-and-newer SR / SV wheeled skid steers and TR / TV compact track loaders the identification plate is on the rear of the machine under the base of the left lift arm. Older Case skid steers (1840, 1845C, 90XT) used in-cab plates — typically on the kick plate or the right-hand side of the cab interior.",
  },
  {
    q: "How do I decode a Case 17-character VIN/PIN?",
    a: "Modern Case VINs/PINs follow ISO 3779. Position 1-3 identifies the manufacturer (YDH = CNH Industrial / Case Construction). Positions 4-8 describe the equipment. Position 9 is a check digit. Position 10 encodes the year (P = 2023, R = 2024, S = 2025). Position 11 is the manufacturing plant. Positions 12-17 are the sequential production number.",
  },
  {
    q: "What does the year code on a Case PIN mean?",
    a: "On the modern 17-character PIN, the 10th character is the year code. Common recent years: J = 2018, K = 2019, L = 2020, M = 2021, N = 2022, P = 2023, R = 2024, S = 2025. The letters I, O, Q, U, and Z are skipped to avoid confusion with numerals.",
  },
  {
    q: "What does YDH or YDJ mean on a Case serial number?",
    a: "These are CNH Industrial manufacturer codes. YDH = Case Construction. YDJ = Case IH (agricultural). YDK = New Holland. JAF, CGK, and similar prefixes are also Case Construction variants used on different production lines.",
  },
  {
    q: "Why does my Case dealer also need the engine serial number?",
    a: "Case parts catalogs are PIN-driven, but engine, axle, and gearbox each carry their own serial plates. Two machines built in the same year and same model can take different engine parts depending on which engine variant was fitted (FPT / Cursor / NEF). Recording the chassis PIN plus the engine serial from the engine plate lets the dealer pull the correct parts on the first try.",
  },
  {
    q: "Can I look up Case parts that fit my machine on this site?",
    a: "Yes — when you run the lookup with a model code we search our parts catalog for items keyed to your model and surface them in the result panel. If your part isn't above, click \"Get a Case parts quote\" and your model and serial pre-fill on the quote form.",
  },
];

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
  const url = 'https://www.flatearthequipment.com/case-serial-number-lookup';

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to find your Case Construction serial number",
    description: "Locate the machine identification plate and decode the Case PIN/VIN for parts and service.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Identify the equipment family",
        text: "Determine whether the machine is a 580 backhoe loader, a SR / SV skid steer, a TR / TV compact track loader, a CX excavator, an M-series crawler dozer, a G-series wheel loader, or a Case IH tractor."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Locate the identification plate",
        text: "On 580 backhoes the plate is on the left dash inside the cab door (older B/C/D), stamped on the frame under the cab (E/K), or on the left chassis beneath the loader-arm pivot (M / Super L / SM / SN / SNWT / Super R). On 2014+ SR/SV/TR/TV machines the plate is on the rear under the base of the left lift arm. On CX excavators the plate is on the cab frame near the boom mount."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Read the serial / VIN / PIN",
        text: "Modern Case machines use a 17-character ISO VIN. Older units use shorter sequential serial numbers with a 3-letter manufacturer prefix. Record exactly as shown on the plate."
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Run the lookup",
        text: "Type the serial / VIN / PIN, equipment type, and model into the form above. The tool decodes year (position 10), plant (position 11), and surfaces plate locations specific to your series."
      }
    ]
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  };

  const partsThatFit = result?.partsThatFit || [];
  const quoteHref = (() => {
    const params = new URLSearchParams();
    const m = (result?.input?.model || model || "").trim();
    const s = (result?.input?.serial || serial || "").trim();
    const eq = m ? `Case ${m}` : "Case Construction";
    params.set("equipment", eq);
    if (s) {
      params.set("notes", `PIN / serial: ${s}${m ? ` (${m})` : ""} — looked up from /case-serial-number-lookup`);
    }
    return `/quote?${params.toString()}`;
  })();

  return (
    <>
      <SerialToolJsonLd brand={brand} url={url} />
      {/*
        Server-rendered JSON-LD via raw <script> tags so crawlers see the
        structured data on first request. Replaces the prior next/script
        usage which only injected after hydration.
      */}
      <script
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
              url: "https://www.flatearthequipment.com",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
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

                  {/* Parts that fit this machine */}
                  {partsThatFit.length > 0 && (
                    <div className="border-t pt-5">
                      <h3 className="font-semibold text-slate-900 mb-3">Case parts that fit this machine</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {partsThatFit.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/parts/${p.slug}`}
                            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-amber-500 hover:shadow-sm transition-colors"
                          >
                            <div className="font-medium text-slate-900">{p.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {p.sales_type === "direct" && p.price_cents
                                ? `In stock — $${(p.price_cents / 100).toFixed(2)}`
                                : "Quote on request"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contextual conversion CTA */}
                  <div className="rounded-xl border border-amber-400 bg-amber-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Need a part for this Case machine?</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      We&apos;ll pre-fill your make, model, and PIN so we can come back with accurate pricing — no account required.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={quoteHref}
                        className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                      >
                        Get a Case parts quote
                      </a>
                      <Link
                        href="/parts/construction-equipment-parts"
                        className="text-sm text-slate-700 underline hover:text-amber-700"
                      >
                        Browse construction parts
                      </Link>
                      <a
                        href="tel:+18883929175"
                        className="text-sm text-slate-700 underline hover:text-amber-700"
                      >
                        Or call (888) 392-9175
                      </a>
                    </div>
                  </div>

                  {/* Official Lookup Link */}
                  {result.officialLookupUrl && (
                    <a
                      href={result.officialLookupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition"
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

          {/* Rubber tracks cross-links (static, crawlable) */}
          <div className="mb-8">
            <BrandRubberTracksSection brand="case" brandLabel="Case" />
          </div>

          {/* Visible FAQ — mirrors the FAQPage JSON-LD */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 mb-6">
              Sources: Case 580B/C/D/E/K dealer references, ConEquip Parts skid-steer location guide, ISO 3779 VIN/PIN structure.
            </p>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
              {FAQS.map((item, i) => (
                <details key={i} className="group p-5 open:bg-slate-50">
                  <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="ml-4 text-slate-400 transition-transform group-open:rotate-45 select-none">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

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
