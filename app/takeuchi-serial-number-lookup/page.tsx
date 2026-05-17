"use client";
import { useState } from "react";

type PlateTip = {
  equipment_type: string;
  series: string | null;
  location_notes: string;
};

type RangeRow = {
  model_code: string;
  serial_range: string;
  notes: string | null
};

type PartFit = {
  slug: string;
  name: string;
  sales_type: string | null;
  price_cents: number | null;
  is_fast_moving: boolean | null;
};

type ApiResp = {
  input?: { serial: string; model: string | null };
  parsed?: { family: string | null };
  plate?: { guidance: PlateTip[] };
  serialRanges?: RangeRow[];
  partsThatFit?: PartFit[];
  notes?: string[];
  error?: string;
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a Takeuchi compact excavator (TB-series)?",
    a: "On Takeuchi TB-series mini-excavators (TB125, TB135, TB145, TB175, TB230, TB23R, TB235, TB260, TB290 and others) the identification plate is on the right or left side of the front face of the machine, below the operator's compartment. This is the same general location as Bobcat mini-excavators. The Takeuchi service manual identification section confirms the plate is also stamped/affixed near the front of the upper structure.",
  },
  {
    q: "Where is the serial number on a Takeuchi compact track loader (TL-series)?",
    a: "On Takeuchi TL-series compact track loaders (TL230, TL240, TL250, TL6R, TL8R2, TL10V2, TL11R3, TL12R2, TL12V2) the identification plate is on the front of the machine under the front glass / operator door. On TL230 / TL250 variants the primary serial is also stamped on the frame near the rear serial tag.",
  },
  {
    q: "Why does Takeuchi say to record both the machine and engine serial?",
    a: "Takeuchi service manuals explicitly instruct recording the machine serial (PIN) from the nameplate AND the engine serial from its own plate. Track loader manuals state \"Do not remove the machine name plate\" and provide spaces in the manual to record both numbers. Parts catalogs are gated on the machine serial; engine parts are gated on the engine serial.",
  },
  {
    q: "How do I find the year of my Takeuchi by serial number?",
    a: "Takeuchi does not publish a universal year-from-serial decode across models. Read the model year directly from the machine identification plate (often printed on the plate alongside the serial). The lookup above will surface any published serial-number blocks we have for your model, but the plate is the official source.",
  },
  {
    q: "What does the serial-number block on a Takeuchi parts catalog mean?",
    a: "Takeuchi parts catalogs sometimes list a starting serial number for a part — meaning that part fits machines from that serial onward. Submitting your full serial lets the dealer match the right block and pull the correct part on the first try.",
  },
  {
    q: "Can I look up Takeuchi parts that fit my machine on this site?",
    a: "Yes — when you run the lookup with a model code we search our parts catalog for items keyed to your model and surface them in the result panel. If your part isn't above, click \"Get a Takeuchi parts quote\" and we'll come back with confirmed pricing.",
  },
];

export default function Page() {
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true); 
    setData(null);
    
    try {
      const res = await fetch("/api/takeuchi-lookup", {
        method: "POST", 
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serial, model: model || undefined })
      });
      const json = await res.json(); 
      setData(json);
    } catch (error) {
      setData({ error: "Failed to process request" });
    }
    
    setLoading(false);
  }

  const pageUrl = "https://www.flatearthequipment.com/takeuchi-serial-number-lookup";

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Takeuchi Serial Number Lookup",
    description: "Free tool to identify Takeuchi nameplate locations for TB-series compact excavators, TL-series compact track loaders, TS-series skid steers, TW-series wheel loaders, and TCR crawler dumpers; surfaces known parts-book serial blocks and parts that fit your machine.",
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
    name: "How to find your Takeuchi serial number",
    description: "Locate the machine nameplate and engine plate on Takeuchi compact excavators, track loaders, skid steers, and wheel loaders.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Identify the equipment family",
        text: "Determine whether the machine is a TB-series compact excavator, TL-series compact track loader, TS-series skid steer, TW-series wheel loader, or TCR-series crawler dumper. The plate location depends on the family."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Locate the machine nameplate",
        text: "On TB compact excavators the plate is on the right or left side of the front face, below the operator station. On TL compact track loaders the plate is on the front under the front glass / operator door. TL230 and TL250 variants also have the serial stamped on the frame near the rear serial tag."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Record both the machine and engine serial",
        text: "Takeuchi service manuals explicitly tell operators to record BOTH the machine serial from the nameplate and the engine serial from the engine plate. Parts catalogs gate machine parts on one number and engine parts on the other."
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Run the lookup",
        text: "Type your serial / PIN and model into the form above. The tool infers the family and surfaces any published parts-book serial blocks we have for your model."
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

  const partsThatFit = data?.partsThatFit || [];
  const quoteHref = (() => {
    const params = new URLSearchParams();
    const m = (data?.input?.model || model || "").trim();
    const s = (data?.input?.serial || serial || "").trim();
    const eq = m ? `Takeuchi ${m}` : "Takeuchi";
    params.set("equipment", eq);
    if (s) {
      params.set("notes", `PIN / serial: ${s}${m ? ` (${m})` : ""} — looked up from /takeuchi-serial-number-lookup`);
    }
    return `/quote?${params.toString()}`;
  })();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Server-rendered JSON-LD */}
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

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Takeuchi Serial Number Lookup
      </h1>
      <p className="mt-2 text-slate-600">
        Enter your serial/PIN and optional model (e.g., TL8R2, TL12V2, TB260, TB290, TW80, plus classic generations TB145, TB175, TB230, TL230, TL250).
        We&apos;ll show where to find the nameplate and any known S/N blocks.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="takeuchi-serial" className="block text-sm font-medium mb-1">Serial / PIN</label>
            <input
              id="takeuchi-serial"
              className="w-full rounded-xl border px-3 py-2"
              placeholder="e.g., TL12V2 412000123, TB290 1900xxxxx, TB145, TB175"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="takeuchi-model" className="block text-sm font-medium mb-1">Model (optional)</label>
            <input
              id="takeuchi-model"
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Current: TL6R, TL8R2, TL10V2, TL11R3, TL12R2, TL12V2 • TB216, TB235-2, TB260, TB290 • TW60/TW80/TW95 • Classic: TB125, TB135, TB145, TB175, TB230, TL230, TL240, TL250, TB153FR, TB23R"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Manuals show the machine nameplate (serial) and the engine plate; record both exactly as shown.
            </p>
          </div>
        </div>
        <button 
          type="submit" 
          className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors" 
          disabled={loading}
        >
          {loading ? "Checking…" : "Check Serial"}
        </button>
      </form>

      {data && (
        <div className="mt-6 rounded-2xl border p-5 bg-slate-50">
          {"error" in data && data.error ? (
            <p className="text-red-600">Error: {data.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.family || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Known ranges</div>
                  <div className="font-medium">{data.serialRanges?.length ? data.serialRanges.length : "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Inputs</div>
                  <div className="font-medium truncate">{data.input?.model || "—"} · {data.input?.serial}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find it / What to record</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">
                        {t.equipment_type}{t.series ? ` — ${t.series}` : ""}:
                      </span> {t.location_notes}
                    </li>
                  )) : (
                    <li>Use the machine nameplate for the serial (PIN) and record the engine serial from the engine plate.</li>
                  )}
                </ul>
              </div>

              {data.serialRanges && data.serialRanges.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Published serial-number blocks</h3>
                  <div className="space-y-2">
                    {data.serialRanges.map((r, i) => (
                      <div key={i} className="rounded-xl bg-white p-3 border text-sm">
                        <div className="font-medium">{r.model_code}</div>
                        <div className="text-slate-600">{r.serial_range}</div>
                        {r.notes && <div className="text-xs text-slate-500 mt-1">{r.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.notes?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n, i) => (<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {/* Parts that fit this machine */}
              {partsThatFit.length > 0 && (
                <div className="mt-6 border-t pt-5">
                  <h3 className="font-semibold text-slate-900 mb-3">Takeuchi parts that fit this machine</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {partsThatFit.map((p) => (
                      <a
                        key={p.slug}
                        href={`/parts/${p.slug}`}
                        className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-orange-500 hover:shadow-sm transition-colors"
                      >
                        <div className="font-medium text-slate-900">{p.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {p.sales_type === "direct" && p.price_cents
                            ? `In stock — $${(p.price_cents / 100).toFixed(2)}`
                            : "Quote on request"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual conversion CTA */}
              <div className="mt-6 border-t pt-5">
                <div className="rounded-xl border border-orange-400 bg-orange-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Need a part for this Takeuchi?</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    We&apos;ll pre-fill your make, model, and PIN so we can come back with accurate pricing — no account required.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={quoteHref}
                      className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
                    >
                      Get a Takeuchi parts quote
                    </a>
                    <a
                      href="/parts/construction-equipment-parts"
                      className="text-sm text-slate-700 underline hover:text-orange-700"
                    >
                      Browse construction parts
                    </a>
                    <a
                      href="tel:+18883929175"
                      className="text-sm text-slate-700 underline hover:text-orange-700"
                    >
                      Or call (888) 392-9175
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Resources Section */}
              <div className="mt-8 p-4 bg-white rounded-xl border">
                <h3 className="font-semibold mb-3 text-sm">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <a 
                    href="/safety" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Equipment Training</div>
                    <div className="text-slate-600">OSHA training for compact excavators and track loaders</div>
                  </a>
                  <a 
                    href="/quote" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Parts Quote</div>
                    <div className="text-slate-600">Get pricing for Takeuchi parts and components</div>
                  </a>
                  <a 
                    href="/parts" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Takeuchi Parts</div>
                    <div className="text-slate-600">Browse excavator and track loader replacement parts</div>
                  </a>
                  <a 
                    href="/battery-chargers" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Battery Chargers</div>
                    <div className="text-slate-600">Chargers for electric equipment and auxiliary systems</div>
                  </a>
                </div>
              </div>

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline hover:text-blue-600" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/clark-serial-number-lookup">Clark</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/mitsubishi-serial-number-lookup">Mitsubishi</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/doosan-serial-number-lookup">Doosan</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/genie-serial-number-lookup">Genie</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/jlg-serial-number-lookup">JLG</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/jcb-serial-number-lookup">JCB</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/case-serial-number-lookup">CASE</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/xcmg-serial-number-lookup">XCMG</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/toro-serial-number-lookup">Toro</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/sinoboom-serial-number-lookup">Sinoboom</a>
              </section>
            </>
          )}
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sources: Takeuchi service-manual identification sections, ConEquip Parts Takeuchi mini-excavator reference, ACT Takeuchi parts dealer guide.
        </p>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
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
      </section>
    </div>
  );
}
