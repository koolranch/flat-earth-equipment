"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

type PartFit = {
  slug: string;
  name: string;
  sales_type: string | null;
  price_cents: number | null;
};

type ApiResponse = {
  input?: { serial: string; equipmentType: string | null; model: string | null };
  modules?: { moduleCode: string; productionSequence: string; moduleDictionaryHit: ModuleHit | null };
  plate?: { guidance: PlateTip[]; note: string };
  legacyYear?: { estimatedYear: number; method: string } | null;
  partsThatFit?: PartFit[];
  notes?: string[];
  disclaimer?: string;
  error?: string;
};

const EQUIPMENT_TYPES = ["Loader", "Track Loader", "Excavator", "Mini Track Loader"];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a Bobcat skid steer?",
    a: "On R-Series loaders (2020-present) the identification plate is on the right side rear, above the upper-right tailgate corner. M-Series loaders (2010-2020) carry it on the right side of the main frame, below the cooling compartment. K-Series loaders (2007-2014) have it on the rear frame upright. Older 40-80 series loaders (pre-2007) vary — check inside or outside the rear upright.",
  },
  {
    q: "Where is the serial number on a Bobcat compact track loader?",
    a: "Compact track loaders (T-series) follow the same generation pattern as skid steers. T450 / T550 / T590 / T595 / T630 / T650 / T740 / T770 / T870 plates sit on the right side of the chassis, above the upper-right tailgate corner on R-generation cabs and below the cooling compartment on M-generation cabs.",
  },
  {
    q: "Where is the serial number on a Bobcat compact excavator?",
    a: "On R-Series compact excavators (2017-present, E10 / E20 / E32 / E35 / E42 / E50 / E55 / E60 / E85) the identification plate is on the front of the cab, beside the boom. M-Series excavators (2010-2017) have it on the front of the cab near the door, beside the boom.",
  },
  {
    q: "How do I find the year of my Bobcat by serial number?",
    a: "The model year is printed directly on the product identification plate. If the plate is unreadable, type your model and 9-digit serial into the lookup above — for current S-series, T-series, and E-series models we cross-reference against published year-cut serial ranges (B3BT for S450, A3NW for S650, A3P4 for S770/T770, A3P6 for S850/T870, etc.) and return an estimated year. For older 843-class machines we use the 5-digit numeric range.",
  },
  {
    q: "What do the digits in a Bobcat serial number mean?",
    a: "Bobcat uses a 9-digit serial split as 4+5: the first 4 digits are the module code (model + engine combination — for example 5150 = S650 with the Kubota V2607 engine), and the last 5 digits are the production sequence number indicating order of manufacture. Year is not encoded; it lives on the plate.",
  },
  {
    q: "Why does the parts dealer ask for the full serial instead of just the year?",
    a: "Bobcat parts catalogs are serial-driven. Across a single model year there can be mid-run changes — a different hydraulic block, harness revision, or pump update — gated by serial number. Submitting the full 9-digit serial lets the catalog return the parts that actually fit your specific machine instead of a year-average best guess.",
  },
  {
    q: "Can I look up Bobcat parts by serial number on this site?",
    a: "Yes — when you run the lookup with a model code, we search our parts catalog for items keyed to your model and surface them in the result panel. If nothing matches your specific model yet, click \"Get a Bobcat parts quote\" and your model and serial pre-fill on the quote form.",
  },
];

export default function BobcatLookupPage() {
  const [equipmentType, setEquipmentType] = useState<string>("Loader");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState(""); // optional (e.g., 843)
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const pageUrl = "https://www.flatearthequipment.com/bobcat-serial-number-lookup";

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bobcat Serial Number Lookup",
    description: "Free tool to decode Bobcat equipment serial numbers. Identifies module code, production sequence, estimates year for current S/T/E models from published serial ranges, and surfaces matching parts from inventory.",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: {
      "@type": "Organization",
      name: "Flat Earth Equipment",
      url: "https://www.flatearthequipment.com"
    }
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to find your Bobcat serial number",
    description: "Locate the product identification plate and decode a Bobcat 9-digit (4+5) serial number for parts and service.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Identify the equipment family",
        text: "Determine whether the machine is a skid steer or compact track loader (S/T-series), a compact excavator (E-series), a mini track loader (MT-series), a compact wheel loader (L-series), a small articulated loader, or a telehandler (V/TL-series). The plate location depends on the family and generation."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Locate the identification plate",
        text: "On R-Series skid steers and CTLs (2020-present) the plate is on the right side rear above the tailgate corner. M-Series (2010-2020) is on the right side of the main frame below the cooling compartment. K-Series (2007-2014) is on the rear frame upright. R-Series excavators (2017-present) carry it on the front of the cab beside the boom."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Read the 9-digit serial number",
        text: "Bobcat serials are 9 digits split 4+5. The first 4 are the module code (model + engine), the last 5 are the production sequence. Record both."
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Note the model year from the plate",
        text: "The model year is printed directly on the product identification plate. Year is not encoded in the digits."
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Run the lookup",
        text: "Type your serial, equipment type, and model into the form above to confirm the plate location, get a year estimate from published serial ranges, and surface parts in our catalog that fit your machine."
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
  const partsThatFit = useMemo(() => data?.partsThatFit || [], [data]);
  const apiNotes = useMemo(() => data?.notes || [], [data]);

  const quoteHref = (() => {
    const params = new URLSearchParams();
    const m = (data?.input?.model || model || "").trim();
    const s = (data?.input?.serial || serial || "").trim();
    const eq = m ? `Bobcat ${m}` : "Bobcat";
    params.set("equipment", eq);
    if (s) {
      params.set("notes", `PIN / serial: ${s}${m ? ` (${m})` : ""} — looked up from /bobcat-serial-number-lookup`);
    }
    return `/quote?${params.toString()}`;
  })();

  return (
    <>
      {/*
        Server-rendered JSON-LD via plain <script> tags so the structured
        data lands in the initial HTML response for crawlers.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

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

                {/* Parts that fit this machine */}
                {partsThatFit.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-3">
                      Bobcat parts that fit this machine
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {partsThatFit.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/parts/${p.slug}`}
                          className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-red-400 hover:shadow-sm transition-colors"
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

                {/* Contextual conversion: pre-filled parts quote for this machine */}
                <div className="border-t pt-6">
                  <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Need a part for this Bobcat?
                    </h4>
                    <p className="mt-1 text-sm text-slate-700">
                      We&apos;ll pre-fill your make, model, and serial so we can come back with accurate pricing — no account required.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={quoteHref}
                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                      >
                        Get a Bobcat parts quote
                      </a>
                      <Link
                        href="/parts/construction-equipment-parts"
                        className="text-sm text-slate-700 underline hover:text-red-700"
                      >
                        Browse construction parts
                      </Link>
                      <a
                        href="tel:+18883929175"
                        className="text-sm text-slate-700 underline hover:text-red-700"
                      >
                        Or call (888) 392-9175
                      </a>
                    </div>
                  </div>
                </div>

                {/* Lookup notes (e.g. no published serial range found) */}
                {apiNotes.length > 0 && (
                  <div className="text-xs text-slate-500 space-y-1">
                    {apiNotes.map((n, i) => (<p key={i}>• {n}</p>))}
                  </div>
                )}

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

        {/* Visible FAQ — mirrors the FAQPage JSON-LD above */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sources: Bobcat published serial-number documentation and parts-catalog dealer references compiled in our long-form Bobcat serial-number guide.
          </p>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQS.map((item, i) => (
              <details key={i} className="group p-5 open:bg-slate-50">
                <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="ml-4 text-slate-400 transition-transform group-open:rotate-45 select-none">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
