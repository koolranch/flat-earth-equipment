"use client";
import { useState } from "react";
import Script from "next/script";

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

type ApiResp = {
  input?: { serial: string; model: string | null };
  parsed?: { family: string | null };
  plate?: { guidance: PlateTip[] };
  serialRanges?: RangeRow[];
  notes?: string[];
  error?: string;
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a Kubota tractor?",
    a: "On Kubota compact, mid-size, and utility tractors the serial number is printed on a sticker at the front right corner of the tractor and also stamped into the frame in the same area as a backup. Always record the engine serial separately — it is on a plate on the engine block, not on the chassis tag.",
  },
  {
    q: "Where is the serial number on a Kubota compact track loader (SVL)?",
    a: "On SVL65-2, SVL75-2, SVL75-3, SVL95-2s, SVL97-3 and SVL110-3 the identification plate is on the left front of the chassis, just below the cab door sill on the outside of the cab. If the sticker is worn the serial is also stamped into the welded frame in the same area.",
  },
  {
    q: "Where is the serial number on a Kubota mini excavator (KX or U series)?",
    a: "On Kubota KX-series and U-series compact excavators the identification plate is on the right (curb) side at the front edge of the cab, under the window glass and near the base of the boom. On smaller machines without a cab the plate sits in the same location on the canopy frame.",
  },
  {
    q: "How do I decode a Kubota serial number?",
    a: "Newer Kubota construction equipment uses a 17-digit chassis serial number. Digits 1–3 identify the engineering business unit (KBC for construction, KBU for compact tractors). Digit 10 encodes the manufacturing year and digit 12 encodes the month using a letter code that skips I and O. Digits 13–17 are the original sequential production number. Older machines built before the change still carry the legacy 5-digit sequential serial.",
  },
  {
    q: "What year is my Kubota by serial number?",
    a: "Kubota does not sell tractors as model years and does not encode a calendar year in the legacy 5-digit serial. On the new 17-digit serial, the 10th character is the manufacturing year (for example N = 2022, P = 2023). Kubota also notes that the year of the machine is normally the year it was originally sold, not the year it was built. For dating used machines, the engine plate is the most reliable starting point because it carries its own date code.",
  },
  {
    q: "Why does my Kubota dealer also need the engine serial number?",
    a: "Kubota uses serial-number breaks in its parts catalogs. Two machines with the same model code can take different parts depending on whether their PIN or engine serial falls before or after a break. Recording both the chassis PIN from the data tag and the engine serial from the engine plate lets the dealer pull the correct parts on the first try.",
  },
  {
    q: "What does Kubota mean by a 'serial-number break'?",
    a: "When Kubota changes a component during a model run, the parts book lists the change as a serial-number break — for example 'From 25001' for the KX057-4 or a component-level S/N gate on a U35-4 meter assembly. Use the lookup above to surface known breaks for your model; if none are listed, the data tag and engine plate are still all the dealer needs.",
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
      const res = await fetch("/api/kubota-lookup", {
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

  const quoteHref = (() => {
    const params = new URLSearchParams();
    const m = (data?.input?.model || model || "").trim();
    const s = (data?.input?.serial || serial || "").trim();
    const eq = m ? `Kubota ${m}` : "Kubota";
    params.set("equipment", eq);
    if (s) {
      params.set("notes", `PIN / serial: ${s}${m ? ` (${m})` : ""} — looked up from /kubota-serial-number-lookup`);
    }
    return `/quote?${params.toString()}`;
  })();

  const pageUrl = "https://www.flatearthequipment.com/kubota-serial-number-lookup";

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kubota Serial Number Lookup",
    description: "Free tool to identify Kubota serial-number plate locations and known parts-catalog serial breaks for SVL track loaders, SSV skid steers, KX and U mini excavators, R wheel loaders, and TLB models.",
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
    name: "How to find your Kubota serial number",
    description: "Locate the chassis Product Identification Number (PIN) and engine serial number on Kubota construction equipment.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Identify the equipment family",
        text: "Determine whether your machine is a compact track loader (SVL), skid steer (SSV), compact excavator (KX or U), wheel loader (R), or tractor-loader-backhoe (L47, M62). The plate location depends on the family."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Locate the chassis identification plate",
        text: "On SVL track loaders the plate is at the left front of the chassis below the cab door sill. On SSV skid steers it is on the front right corner of the frame near the operator station. On KX and U mini excavators it is on the right (curb) side at the front edge of the cab under the window. On R wheel loaders it is on the right side of the front frame. On L47 and M62 TLBs it is on the left side of the main frame."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Record the full Product Identification Number",
        text: "Newer Kubota machines carry a 17-digit chassis serial. Photograph the plate and write the full PIN down. Older machines may still use the legacy 5-digit serial — record the model code with it."
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Record the engine serial separately",
        text: "Kubota engines carry their own serial number on a plate on the engine block. Capture this number too — Kubota uses parts breaks at both the chassis and engine level."
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Run the lookup",
        text: "Type your PIN and model into the form above to confirm the plate location for your specific machine and surface any published parts-book serial breaks."
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Script
        id="kubota-lookup-webapp-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(webAppLd)}
      </Script>
      <Script
        id="kubota-lookup-howto-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(howToLd)}
      </Script>
      <Script
        id="kubota-lookup-faq-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(faqLd)}
      </Script>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Kubota Serial Number Lookup
      </h1>
      <p className="mt-2 text-slate-600">
        Enter your PIN/serial and optional model (e.g., SVL75-3, SVL97-3, SSV75, KX057-5, U55-5, R540, L47).
        We&apos;ll show official plate locations by family and any published serial breaks.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="kubota-pin" className="block text-sm font-medium mb-1">PIN / Serial</label>
            <input
              id="kubota-pin"
              className="w-full rounded-xl border px-3 py-2"
              placeholder="e.g., SVL75-3 KBCZ0... / KX057-5 25xxx+"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="kubota-model" className="block text-sm font-medium mb-1">Model (optional)</label>
            <input
              id="kubota-model"
              className="w-full rounded-xl border px-3 py-2"
              placeholder="SVL65-2, SVL75-3, SVL97-3 • SSV65, SSV75 • KX040-4, KX057-5, KX080-4 • U35-4, U55-5 • R430, R540, R640 • L47, M62"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Also record the engine serial from the engine plate for parts accuracy.
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
                  <div className="text-slate-500">Known serial breaks</div>
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
                    <li>Use the machine data tag/nameplate for the PIN and the engine plate for engine serial.</li>
                  )}
                </ul>
              </div>

              {data.serialRanges && data.serialRanges.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold mb-2">Published serial-number breaks</h3>
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

              {/* Contextual conversion: pre-filled parts quote for this machine */}
              <div className="mt-6 rounded-xl border border-canyon-rust/30 bg-canyon-rust/5 p-4">
                <h3 className="font-semibold text-slate-900">
                  Need a part for this Kubota?
                </h3>
                <p className="mt-1 text-sm text-slate-700">
                  We&apos;ll pre-fill your make, model, and PIN so we can come back with accurate pricing — no account required.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={quoteHref}
                    className="inline-flex items-center rounded-2xl bg-canyon-rust px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
                  >
                    Get a Kubota parts quote
                  </a>
                  <a
                    href="/parts"
                    className="text-sm text-slate-700 underline hover:text-canyon-rust"
                  >
                    Browse Kubota parts
                  </a>
                  <a
                    href="tel:+18883929175"
                    className="text-sm text-slate-700 underline hover:text-canyon-rust"
                  >
                    Or call (888) 392-9175
                  </a>
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
                    <div className="text-slate-600">OSHA training for excavators, track loaders, and equipment operation</div>
                  </a>
                  <a 
                    href="/quote" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Parts Quote</div>
                    <div className="text-slate-600">Get pricing for Kubota parts and components</div>
                  </a>
                  <a 
                    href="/parts" 
                    className="block p-3 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium mb-1">Kubota Parts</div>
                    <div className="text-slate-600">Browse excavator, loader, and compact equipment parts</div>
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
                <a className="underline hover:text-blue-600" href="/sinoboom-serial-number-lookup">Sinoboom</a> ·{" "}
                <a className="underline hover:text-blue-600" href="/takeuchi-serial-number-lookup">Takeuchi</a>
              </section>
            </>
          )}
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sources: Kubota engine.kubota.com serial-number identification, Kubota USA brochures, and Kubota parts-catalog dealer references (Messick&apos;s, ConEquip).
        </p>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQS.map((item, i) => (
            <details key={i} className="group p-5 open:bg-slate-50">
              <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden flex items-center justify-between">
                <span>{item.q}</span>
                <span className="ml-4 text-slate-400 transition-transform group-open:rotate-45 select-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
