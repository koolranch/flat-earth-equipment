"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, MapPin, Wrench, Settings, Camera, FileText } from "lucide-react";

type PlateLocation = {
  id: number;
  model_pattern: string;
  location_text: string;
  confidence: 'high' | 'medium' | 'verify';
  source_url?: string;
  source_quote?: string;
};

type SerialPattern = {
  id: number;
  pattern_label: string;
  example_sn?: string;
  interpretation_note: string;
  source_url?: string;
  source_quote?: string;
};

type ApiResponse = {
  input?: { model: string };
  tips?: {
    plateLocation: string;
    confidence: string;
    sourceUrl?: string;
    sourceQuote?: string;
    allMatches: PlateLocation[];
  } | null;
  serialPatternHints?: SerialPattern[];
  disclaimer?: string;
  error?: string;
};

export default function KarcherLookupPage() {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kärcher Serial Number Lookup",
    "description": "Free tool to find type plate locations on Kärcher scrubbers and sweepers. Step-by-step guidance for BD, BR, B series, KM series, and BRC models.",
    "url": "https://www.flatearthequipment.com/karcher-serial-number-lookup",
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

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where is the serial number on Kärcher machines?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kärcher places the type plate in different locations depending on the model. Walk-behind scrubbers often have it inside the fresh water tank, while ride-on models typically have it under the hood or seat area."
        }
      },
      {
        "@type": "Question", 
        "name": "Why does the serial appear twice on the type plate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kärcher typically prints the serial number twice on the type label: once near the model name for easy reading, and again within the barcode string for scanning purposes."
        }
      },
      {
        "@type": "Question",
        "name": "What should I do if I can't find the type plate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Check your Operator's Manual for the 'Machine Data' section which shows the typical location. If the plate is damaged or missing, contact your Kärcher dealer with the model information."
        }
      }
    ]
  };

  useEffect(() => {
    fetch("/api/karcher-lookup/models")
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => setModels([]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setData(null);
    
    try {
      const res = await fetch("/api/karcher-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model })
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified from manual</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">General guidance</span>;
      case 'verify':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Verify on unit</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <Script id="karcher-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <Script id="karcher-lookup-faq-structured-data" type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Kärcher Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-cyan-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Kärcher Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Find your Kärcher type plate location and serial number
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-cyan-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Type Plate Location</h3>
                <p className="text-sm text-slate-600">Model-specific guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Camera className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Photo Tips</h3>
                <p className="text-sm text-slate-600">Capture the full label</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Manual Check</h3>
                <p className="text-sm text-slate-600">Machine Data section</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your <strong>Kärcher model</strong> (BD, BR, B series, KM series, BRC) to get 
            specific guidance on where to find the type plate and serial number. 
            We'll show you the exact location and what to look for.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Search className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Type Plate Lookup</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kärcher Model *
              </label>
              <input
                list="karcher-models"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., BD 50/50 C Bp Classic, B 150 R, KM 70/20 C"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
              <datalist id="karcher-models">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-500">
                Found on the front panel or documented in your manual
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Finding location...
                </span>
              ) : (
                "Find Type Plate Location"
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
                      Type Plate Location Found
                    </h3>
                    <p className="text-slate-600">
                      Model: {data.input?.model}
                    </p>
                  </div>
                </div>

                {data.tips ? (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-cyan-600" />
                        Where to Look
                      </h4>
                      {getConfidenceBadge(data.tips.confidence)}
                    </div>
                    <p className="text-slate-700 mb-4">{data.tips.plateLocation}</p>
                    
                    {data.tips.sourceUrl && (
                      <p className="text-xs text-slate-500">
                        Source: <a href={data.tips.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-600">Manual reference</a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">General Guidance</h4>
                    <p className="text-slate-700">
                      No specific location found for this model. Check your Operator's Manual 
                      for the 'Machine Data' section, or look for the type plate on the main housing, 
                      under the hood/seat area, or inside tank compartments.
                    </p>
                  </div>
                )}

                {/* Important Steps */}
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Important Steps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                      <Camera className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-slate-900">📸 Photograph the Plate</h5>
                        <p className="text-sm text-slate-600 mt-1">
                          Take a clear photo showing the complete type label with model and serial number visible.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-slate-900">📋 Record in Manual</h5>
                        <p className="text-sm text-slate-600 mt-1">
                          Fill out the 'Machine Data' box in your Operator's Manual for future reference.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Serial Pattern Hints */}
                {data.serialPatternHints && data.serialPatternHints.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Serial Number Tips</h4>
                    <div className="space-y-4">
                      {data.serialPatternHints.map((pattern, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <h5 className="font-semibold text-slate-900 mb-2">{pattern.pattern_label}</h5>
                          <p className="text-slate-700 text-sm">{pattern.interpretation_note}</p>
                          {pattern.example_sn && pattern.example_sn !== "—" && (
                            <p className="text-xs text-slate-600 mt-2 font-mono bg-white px-2 py-1 rounded">
                              Example: {pattern.example_sn}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.disclaimer && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{data.disclaimer}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link 
                    href="/parts"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Find Kärcher Parts
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Kärcher Product Lines</h2>
            <div className="space-y-3 text-slate-700">
              <div>
                <strong>Walk-behind Scrubbers:</strong> BD series (BD 38/12 C, BD 43/25 C, BD 50/50 C)
              </div>
              <div>
                <strong>Ride-on Scrubbers:</strong> B series (B 90 R, B 150 R, B 200 R, B 260 R)
              </div>
              <div>
                <strong>Sweepers:</strong> KM series (KM 70/20 C, KM 75/40 W, KM 90/60 R)
              </div>
              <div>
                <strong>Extractors:</strong> BRC series (BRC 40/22 C)
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                <strong>Tip:</strong> The type plate typically shows the model name, serial number, 
                and often includes a barcode with the serial repeated.
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About Kärcher Type Plates</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dual Location:</strong> Serial appears near model name and in barcode</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Common Areas:</strong> Fresh water tank, under hood/seat, main housing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Manual Reference:</strong> Check 'Machine Data' section for location diagram</span>
              </li>
            </ul>
          </section>
        </div>

        {/* FAQ Section */}
        <section className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-slate-50 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                Where is the serial number on Kärcher machines?
                <span className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 text-slate-700">
                Kärcher places the type plate in different locations depending on the model. Walk-behind 
                scrubbers often have it inside the fresh water tank, while ride-on models typically 
                have it under the hood or seat area.
              </div>
            </details>
            
            <details className="group bg-slate-50 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                Why does the serial appear twice on the type plate?
                <span className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 text-slate-700">
                Kärcher typically prints the serial number twice on the type label: once near the 
                model name for easy reading, and again within the barcode string for scanning purposes.
              </div>
            </details>
            
            <details className="group bg-slate-50 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
                What should I do if I can't find the type plate?
                <span className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="p-4 text-slate-700">
                Check your Operator's Manual for the 'Machine Data' section which shows the typical 
                location. If the plate is damaged or missing, contact your Kärcher dealer with the model information.
              </div>
            </details>
          </div>
        </section>

        {/* Related Links */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link href="/toyota-forklift-serial-lookup" className="text-blue-600 hover:underline">Toyota Serial Lookup</Link>
            <Link href="/hyster-serial-number-lookup" className="text-blue-600 hover:underline">Hyster Serial Lookup</Link>
            <Link href="/factory-cat-serial-number-lookup" className="text-blue-600 hover:underline">Factory Cat Serial Lookup</Link>
            <Link href="/tennant-serial-number-lookup" className="text-blue-600 hover:underline">Tennant Serial Lookup</Link>
            <Link href="/jlg-serial-number-lookup" className="text-blue-600 hover:underline">JLG Serial Lookup</Link>
            <Link href="/haulotte-serial-number-lookup" className="text-blue-600 hover:underline">Haulotte Serial Lookup</Link>
            <Link href="/crown-serial-number-lookup" className="text-blue-600 hover:underline">Crown Serial Lookup</Link>
            <Link href="/cat-serial-number-lookup" className="text-blue-600 hover:underline">Cat Serial Lookup</Link>
          </div>
        </div>
      </main>
    </>
  );
}
