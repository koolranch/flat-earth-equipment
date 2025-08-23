"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Search, CheckCircle, AlertTriangle, Calendar, Wrench } from "lucide-react";

type LookupResponse = {
  input?: { model: string; serial: string; serialNum: number | null };
  match?: { estimatedYear: number; matchedBeginningSerial: string } | null;
  disclaimer?: string;
  error?: string;
  message?: string;
};

export default function ToyotaLookupPage() {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Toyota Forklift Serial Number Lookup",
    "description": "Free tool to estimate Toyota forklift build year by serial number. Helps identify correct parts and maintenance requirements.",
    "url": "https://www.flatearthequipment.com/toyota-forklift-serial-lookup",
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
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.flatearthequipment.com/toyota-forklift-serial-lookup?model={model}&serial={serial}"
      },
      "query-input": [
        {
          "@type": "PropertyValueSpecification",
          "valueName": "model",
          "description": "Toyota forklift model code"
        },
        {
          "@type": "PropertyValueSpecification", 
          "valueName": "serial",
          "description": "Forklift serial number"
        }
      ]
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is this year estimation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our lookup tool uses published serial number ranges by year. While generally accurate, the manufacturing date on your data plate is the official build year if available."
        }
      },
      {
        "@type": "Question",
        "name": "What if my model isn't in the list?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We're continuously adding more model codes. If your model isn't listed, contact us with your model and serial number, and we'll help identify the year and find the right parts."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this for parts ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Knowing your forklift's year helps ensure you order the correct parts. Use our quote form or browse our Toyota parts catalog with your year information."
        }
      }
    ]
  };

  useEffect(() => {
    fetch("/api/toyota-lookup/models")
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => setModels([]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/toyota-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, serial }),
      });
      const data = (await res.json()) as LookupResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script id="toyota-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <Script id="toyota-lookup-faq-structured-data" type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-slate-900">Parts</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Toyota Serial Lookup</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-600 p-3 rounded-lg">
            <Search className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Toyota Forklift Serial Number Lookup
            </h1>
            <p className="text-xl text-slate-600">
              Find your Toyota forklift&apos;s estimated build year instantly
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <Calendar className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Year Estimation</h3>
              <p className="text-sm text-slate-600">Based on serial ranges</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Free & Instant</h3>
              <p className="text-sm text-slate-600">No registration required</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <Wrench className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Parts Support</h3>
              <p className="text-sm text-slate-600">Find compatible parts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
        <p className="text-lg text-slate-700 mb-0">
          Enter your <strong>Toyota model code</strong> and <strong>serial number</strong> below to get an estimated build year. 
          This tool helps you identify the correct parts and maintenance requirements for your forklift.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Serial Number Lookup</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Model Code *
              </label>
              <input
                list="toyota-models"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7FGCU25, 8FGCU30"
                value={model}
                onChange={(e) => setModel(e.target.value.trim().toUpperCase())}
                required
              />
              <datalist id="toyota-models">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-500">
                Found on the data plate or frame of your forklift
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Serial Number *
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 60013, 82200"
                value={serial}
                onChange={(e) => setSerial(e.target.value.trim())}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Numbers only - ignore any letters or prefixes
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Looking up year...
              </span>
            ) : (
              "Find Build Year"
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
          {result.error ? (
            <div className="flex items-start gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Error</h3>
                <p>{result.error}</p>
              </div>
            </div>
          ) : result.match ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="h-8 w-8" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Estimated Build Year: {result.match.estimatedYear}
                  </h3>
                  <p className="text-slate-600">
                    Based on serial number {result.input?.serial} for model {result.input?.model}
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Matched Beginning Serial:</strong> {result.match.matchedBeginningSerial}
                </p>
                {result.disclaimer && (
                  <p className="text-xs text-slate-500 mt-2">{result.disclaimer}</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <Link 
                  href="/parts/forklift-parts"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Find Parts for This Year
                </Link>
                <Link 
                  href="/quote"
                  className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                  Get Parts Quote
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">No Match Found</h3>
                <p className="text-slate-700">
                  We couldn&apos;t estimate a year for that serial number. Please double-check your 
                  model code and serial number, or look for the manufacturing date on your data plate.
                </p>
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
              <span><strong>Data Plate:</strong> Located on the truck (shows model, serial, and often manufacturing date)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Frame Stamp:</strong> Behind or near the mast (if data plate is missing)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Overhead Guard:</strong> Sometimes stamped on the frame above the operator</span>
            </li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Understanding Model Codes</h2>
          <div className="space-y-3 text-slate-700">
            <p>
              <strong>7F Series:</strong> Older generation Toyota forklifts (typically 1999-2007)
            </p>
            <p>
              <strong>8F Series:</strong> Newer generation Toyota forklifts (typically 2007+)
            </p>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
              <strong>Tip:</strong> The generation (7F, 8F) indicates the design series, but the exact 
              year is best determined from serial number ranges or the manufacturing date on the data plate.
            </p>
          </div>
        </section>
      </div>

      {/* FAQ Section */}
      <section className="bg-white border border-slate-200 rounded-lg p-8 mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <details className="group bg-slate-50 rounded-lg">
            <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
              How accurate is this year estimation?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-4 text-slate-700">
              Our lookup tool uses published serial number ranges by year. While generally accurate, 
              the manufacturing date on your data plate is the official build year if available.
            </div>
          </details>
          
          <details className="group bg-slate-50 rounded-lg">
            <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
              What if my model isn&apos;t in the list?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-4 text-slate-700">
              We&apos;re continuously adding more model codes. If your model isn&apos;t listed, 
              contact us with your model and serial number, and we&apos;ll help identify the year 
              and find the right parts.
            </div>
          </details>
          
          <details className="group bg-slate-50 rounded-lg">
            <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-slate-900 group-open:border-b border-slate-200">
              Can I use this for parts ordering?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-4 text-slate-700">
              Yes! Knowing your forklift&apos;s year helps ensure you order the correct parts. 
              Use our quote form or browse our Toyota parts catalog with your year information.
            </div>
          </details>
        </div>
      </section>

      {/* Comprehensive Guide Callout */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="bg-slate-600 p-2 rounded-lg flex-shrink-0">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">📖 Need More Detail?</h3>
            <p className="text-slate-700 mb-4">
              For detailed serial number location guides, manual lookup tables, and comprehensive model information, 
              check out our complete reference guide.
            </p>
            <Link 
              href="/parts/toyota-forklift-year-by-serial-number"
              className="inline-flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-semibold"
            >
              <Search className="h-4 w-4" />
              View Complete Serial Number Guide
            </Link>
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
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">Toyota Forklift Parts</h3>
              </div>
              <p className="text-sm text-slate-600">
                Browse our complete inventory of Toyota forklift parts by model and year.
              </p>
            </div>
          </Link>
          
          <Link href="/battery-chargers" className="group">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all group-hover:border-orange-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-5 text-orange-600">⚡</div>
                <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">Toyota Battery Chargers</h3>
              </div>
              <p className="text-sm text-slate-600">
                Professional 24V-80V chargers compatible with Toyota electric forklifts. Fast and overnight options.
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
                Need specific parts? Get a fast, accurate quote from our parts experts.
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
