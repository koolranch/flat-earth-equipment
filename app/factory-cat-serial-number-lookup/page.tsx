'use client';
import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Search, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

type PlateTip = { equipment_type:string; series:string|null; location_notes:string };
type ModelNote = { model_code:string; note:string };
type RangeRow = { model_code:string; serial_range:string; notes:string|null };
type ApiResp = {
  input?: { serial:string; model:string };
  parsed?: { family:string|null };
  plate?: { guidance: PlateTip[] };
  modelNotes?: ModelNote[];
  serialRanges?: RangeRow[];
  notes?: string[];
  disclaimer?: string;
  error?: string;
};

export default function Page(){
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [data, setData] = useState<ApiResp|null>(null);
  const [loading, setLoading] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Factory Cat Serial Number Lookup",
    "description": "Free tool to find Factory Cat serial plate locations and capture correct serial numbers for parts/service. Includes S/N break examples.",
    "url": "https://flatearthequipment.com/factory-cat-serial-number-lookup",
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

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setLoading(true); setData(null);
    const res = await fetch('/api/factorycat-lookup',{ method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ serial, model: model || undefined }) });
    const json = await res.json(); setData(json); setLoading(false);
  }

  return (
    <>
      <Script id="factory-cat-lookup-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Factory Cat Serial Lookup</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Factory Cat Serial Number Lookup
              </h1>
              <p className="text-xl text-slate-600">
                Find your Factory Cat data plate location and serial notes
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Search className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Plate Locations</h3>
                <p className="text-sm text-slate-600">Where to find your serial</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Wrench className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-900">S/N Breaks</h3>
                <p className="text-sm text-slate-600">Parts manual examples</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Free & Instant</h3>
                <p className="text-sm text-slate-600">No registration required</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg text-slate-700 mb-0">
            Enter your <strong>Factory Cat serial/PIN</strong> and optional <strong>model</strong> 
            (MicroMag, MicroMini, Mini-HD, Mag-HD, GTX, GTR, XR, Pilot, 34, TR) to get plate 
            locations and any published S/N break examples from parts manuals.
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
                  Serial / PIN *
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., XR… • GTX … • MICROMAG …"
                  value={serial}
                  onChange={(e)=>setSerial(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Found on the data/ID plate
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Model (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MICROMAG • MICROMINI • MINI-HD • MAG-HD • GTX • GTR • XR • PILOT • 34 • TR"
                  value={model}
                  onChange={(e)=>setModel(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Tip: Record the serial exactly as shown on the machine plate.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Checking Serial...
                </span>
              ) : (
                "Check Serial"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {data && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8 shadow-sm">
            {'error' in data && data.error ? (
              <div className="flex items-start gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Error</h3>
                  <p>{data.error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-green-600 mb-6">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Factory Cat Serial Information
                    </h3>
                    <p className="text-slate-600">
                      {data.input?.model ? `Model: ${data.input.model} • ` : ''}Serial: {data.input?.serial}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-6">
                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                    <div className="text-blue-600 font-medium">Family</div>
                    <div className="font-semibold text-slate-900">{data.parsed?.family || '—'}</div>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-4 border border-purple-200">
                    <div className="text-purple-600 font-medium">Serial ranges</div>
                    <div className="font-semibold text-slate-900">{data.serialRanges?.length ? data.serialRanges.length : '—'}</div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 border border-green-200">
                    <div className="text-green-600 font-medium">Plate tips</div>
                    <div className="font-semibold text-slate-900">{data.plate?.guidance?.length || '—'}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                  <ul className="list-disc pl-6 mt-2 text-slate-700 space-y-1">
                    {data.plate?.guidance?.length ? data.plate.guidance.map((t,i)=> (
                      <li key={i}><span className="font-medium">{t.series ? `${t.series} — ` : ''}</span>{t.location_notes}</li>
                    )) : <li>Use the data/ID plate on the control panel or steering column (varies by model). Record the full serial number.</li>}
                  </ul>
                </div>

                {data.serialRanges?.length ? (
                  <div className="mt-5">
                    <h3 className="font-semibold mb-2">Published serial-range notes</h3>
                    <ul className="list-disc pl-6 text-slate-700 space-y-1">
                      {data.serialRanges.map((r,i)=> (
                        <li key={i}><span className="font-medium">{r.model_code}</span>: {r.serial_range}{r.notes ? ` — ${r.notes}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {data.modelNotes?.length ? (
                  <div className="mt-5">
                    <h3 className="font-semibold mb-2">Model-specific serial notes</h3>
                    <ul className="list-disc pl-6 text-slate-700 space-y-1">
                      {data.modelNotes.map((r,i)=> (
                        <li key={i}><span className="font-medium">{r.model_code}</span>: {r.note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {data.disclaimer ? (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{data.disclaimer}</p>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                  <Link 
                    href="/parts"
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
              </>
            )}
          </div>
        )}

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Factory Cat Product Lines</h2>
            <div className="space-y-3 text-slate-700">
              <div>
                <strong>Walk-behind Scrubbers:</strong> MicroMag, MicroMini, Mini-HD, Mag-HD
              </div>
              <div>
                <strong>Rider Scrubbers:</strong> GTX, GTR, XR, Pilot/Pilot-HD
              </div>
              <div>
                <strong>Sweepers:</strong> 34 (walk-behind), TR (rider)
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                <strong>Tip:</strong> Serial plates are typically on the control panel (walk-behind) 
                or steering column area (rider units). Always record the complete serial exactly as shown.
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About Serial Numbers</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>No Year Decoding:</strong> Factory Cat doesn't publish universal year decoders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Parts Splits:</strong> Manuals often show S/N breaks (e.g., ≤56483 vs ≥56484)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Service Info:</strong> Always provide full model + serial for parts/service</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Related Links */}
        <section className="mt-8 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3">More Serial Number Lookups:</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="underline hover:text-blue-600" href="/toyota-forklift-serial-lookup">Toyota</Link>
            <Link className="underline hover:text-blue-600" href="/hyster-serial-number-lookup">Hyster</Link>
            <Link className="underline hover:text-blue-600" href="/jlg-serial-number-lookup">JLG</Link>
            <Link className="underline hover:text-blue-600" href="/haulotte-serial-number-lookup">Haulotte</Link>
            <Link className="underline hover:text-blue-600" href="/tennant-serial-number-lookup">Tennant</Link>
            <Link className="underline hover:text-blue-600" href="/crown-serial-number-lookup">Crown</Link>
            <Link className="underline hover:text-blue-600" href="/cat-serial-number-lookup">Cat</Link>
            <Link className="underline hover:text-blue-600" href="/clark-serial-number-lookup">Clark</Link>
          </div>
        </section>
      </main>
    </>
  );
}
