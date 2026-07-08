"use client";
import { useState } from "react";
import BrandHubBanner from '@/components/brand/BrandHubBanner';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import BrandRubberTracksSection from '@/components/parts/BrandRubberTracksSection';

type PlateTip = { equipment_type: string; series: string | null; location_notes: string; };
type Series = { code: string; example_note: string };
type PartFit = { slug: string; name: string; sales_type: string | null; price_cents: number | null; is_fast_moving: boolean | null };
type ApiResp = {
  input?: { serial: string; model: string | null; equipmentType: string | null };
  parsed?: { inferredCue: string | null; family: string | null; vinYear: number | null };
  plate?: { guidance: PlateTip[] };
  seriesExamples?: Series[];
  partsThatFit?: PartFit[];
  notes?: string[];
  error?: string;
};

const TYPES = [
  "Backhoe Loader",
  "Telehandler (Loadall)",
  "Excavator",
  "Mini Excavator",
  "Skid Steer / CTL",
  "Wheel Loader",
  "Telescopic Wheel Loader",
  "Any"
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a JCB 3CX or 4CX backhoe?",
    a: "On 3CX and 4CX backhoe loaders the machine identification plate is on the right-hand side of the loader tower or cab frame. Major components — engine, axles, gearbox — each carry their own serial plate that the dealer needs separately. Record all of them; the loader-tower PIN alone is not enough to pull the right parts.",
  },
  {
    q: "Where is the serial number on a JCB Loadall telehandler (531-70, 535-95, 540-170)?",
    a: "On Loadall telehandlers the identification plate is in one of the factory-specified positions on the chassis or cab frame, typically near the cab step or the boom-pivot area. The PIN encodes model and build spec; engine, axles, and gearbox carry their own plates. Verify against the stamped frame digits if the plate is unreadable.",
  },
  {
    q: "Where is the serial number on a JCB 8000-series mini excavator (8025ZTS, 8030ZTS, 8035ZTS, 8050ZTS, 8055RTS, 8052/8060)?",
    a: "On 8000-series mini and compact excavators (8008CTS through 8060) the identification plate is on the front face of the upper structure, on either the right or left side. The serial is also stamped into the chassis frame as a backup if the plate is missing or worn.",
  },
  {
    q: "How do I find the year of my JCB?",
    a: "Modern JCBs use a true 17-character PIN. The 10th character of that PIN encodes the manufacturing year (using a letter code that skips I, O, Q, U, and Z). The lookup above decodes this automatically when it detects a 17-character serial. For older JCBs with shorter serials there is no universal year decode — read the model year from the machine identification plate directly.",
  },
  {
    q: "What does a 17-character JCB PIN look like?",
    a: "A 17-character PIN follows ISO 3779 like a vehicle VIN. Position 1-3 identifies the manufacturer, position 4-8 the product line, position 9 is a check digit, position 10 is the model year, position 11 is the manufacturing plant, and positions 12-17 are the sequential production number.",
  },
  {
    q: "Why does my JCB dealer also need the engine serial number?",
    a: "JCB engines (DieselMax 4-cylinder and similar units) carry their own serial number on a plate on the engine block. Two machines built in the same year and same model can take different engine parts depending on which engine variant was fitted. Recording both the chassis PIN from the data tag and the engine serial from the engine plate lets the dealer pull the correct parts on the first try.",
  },
  {
    q: "Can I look up JCB parts that fit my machine on this site?",
    a: "Yes — when you run the lookup with a model code we search our parts catalog for items keyed to your model and surface them in the result panel. If your part isn't above, click \"Get a JCB parts quote\" and we'll come back with confirmed pricing.",
  },
];

export default function Page() {
  const [equipmentType, setType] = useState("Any");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true); 
    setData(null);
    const res = await fetch("/api/jcb-lookup", {
      method: "POST", 
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serial,
        model: model || undefined,
        equipmentType: equipmentType === "Any" ? undefined : equipmentType
      })
    });
    const json = await res.json(); 
    setData(json); 
    setLoading(false);
  }

  const pageUrl = "https://www.flatearthequipment.com/jcb-serial-number-lookup";

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to find your JCB serial number",
    description: "Locate the machine identification plate and decode the JCB PIN for parts and service.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Identify the equipment family",
        text: "Determine whether the machine is a backhoe loader (3CX, 4CX, 3DX, 3CXCOMPACT, 2CX), Loadall telehandler (531-70 / 535-95 / 540-170 / 535-125 / 535-140), excavator (JS, 220X, 8000-series, 19C-1, 48Z-1, 51R-1, 55Z-1, 57C-1, 801 micro), skid steer or CTL (150T, 190T, 3TS, 1CX, 1CXT), wheel loader (411, 427, 457, 160, 170), or telescopic wheel loader (TM, 135 T3, 205 T3)."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Locate the machine identification plate",
        text: "On 3CX/4CX backhoes the plate is on the right-hand side of the loader tower or cab frame. On Loadall telehandlers the plate is on the chassis frame near the cab step. On 8000-series mini-excavators the plate is on the front face of the upper structure, right or left side. On 1CX/1CXT robot CTLs the plate is on the chassis near the operator station."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Record the full PIN and component serials",
        text: "Modern JCB PINs are 17 characters. Record the full PIN, plus the engine serial from the engine plate, plus axle and gearbox serials from their own plates. JCB parts catalogs are PIN- and component-driven."
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Run the lookup",
        text: "Type your serial / PIN, equipment type, and model into the form above. The tool infers the family, surfaces plate locations specific to your series, and decodes the model year from the 10th character if a 17-character PIN is detected."
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
    const eq = m ? `JCB ${m}` : "JCB";
    params.set("equipment", eq);
    if (s) {
      params.set("notes", `PIN / serial: ${s}${m ? ` (${m})` : ""} — looked up from /jcb-serial-number-lookup`);
    }
    return `/quote?${params.toString()}`;
  })();

  return (
    <>
      <SerialToolJsonLd
        name="JCB Serial Number Lookup"
        url="/jcb-serial-number-lookup"
      />
      {/*
        Server-rendered HowTo + FAQPage JSON-LD via raw <script> tags so
        crawlers see the structured data on first request.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">JCB Serial Number Lookup</h1>
        
        <BrandHubBanner slug="jcb" name="JCB" />
      
      <p className="mt-2 text-slate-600">
        Enter a JCB serial/PIN (and optional model). We&apos;ll show plate/stamped-frame locations by family,
        infer the family from common JCB cues (3CX/4CX, Loadall 531-70/535-95/540-170, JS/220X, 150T/190T/3TS, 411/427/457, TM, plus 8000-series mini-ex / 1CX / Z-tail / 135 T3 / 205 T3 / 160-170),
        and decode the model year only when a true 17-character PIN is detected.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl p-5 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jcb-equipment-type" className="block text-sm font-medium mb-1">Equipment Type</label>
            <select id="jcb-equipment-type" className="w-full rounded-xl border px-3 py-2" value={equipmentType} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="jcb-serial" className="block text-sm font-medium mb-1">Serial / PIN</label>
            <input id="jcb-serial" className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 3CX A12345, 531-70, JS220, 220X, 150T, or a 17-char PIN" value={serial} onChange={(e) => setSerial(e.target.value)} required />
            <p className="mt-1 text-xs text-slate-500">
              Tip: Use the machine identification plate; many JCBs also stamp the serial on the frame/chassis.
            </p>
          </div>
        </div>
        <div>
          <label htmlFor="jcb-model" className="block text-sm font-medium mb-1">Model (optional)</label>
          <input id="jcb-model" className="w-full rounded-xl border px-3 py-2" placeholder="e.g., 3CX, 4CX, 531-70, 535-95, 540-170, JS220, 220X, 150T, 3TS-8T, 427, TM320, 8030ZTS, 8055RTS, 1CXT, 19C-1" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
        <button type="submit" className="rounded-2xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50" disabled={loading}>
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
                  <div className="text-slate-500">Inferred cue</div>
                  <div className="font-medium">{data.parsed?.inferredCue || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Family</div>
                  <div className="font-medium">{data.parsed?.family || "—"}</div>
                </div>
                <div className="rounded-xl bg-white p-3 border">
                  <div className="text-slate-500">Model year (PIN only)</div>
                  <div className="font-medium">{data.parsed?.vinYear ?? "—"}</div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-semibold mb-2">Where to find your plate</h3>
                <ul className="list-disc pl-6 mt-2 text-slate-700">
                  {data.plate?.guidance?.length ? data.plate.guidance.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">{t.equipment_type}{t.series ? ` — ${t.series}` : ""}:</span> {t.location_notes}
                    </li>
                  )) : <li>Check the machine identification plate near the operator area or chassis; stamped frame serial is a common backup.</li>}
                </ul>
              </div>

              {data.seriesExamples?.length ? (
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  {data.seriesExamples.map((s, i) => (<p key={i}>• {s.code}: {s.example_note}</p>))}
                </div>
              ) : null}

              {data.notes?.length ? (
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  {data.notes.map((n, i) => (<p key={i}>• {n}</p>))}
                </div>
              ) : null}

              {/* Parts that fit this machine */}
              {partsThatFit.length > 0 && (
                <div className="mt-6 border-t pt-5">
                  <h3 className="font-semibold text-slate-900 mb-3">JCB parts that fit this machine</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {partsThatFit.map((p) => (
                      <a
                        key={p.slug}
                        href={`/parts/${p.slug}`}
                        className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-yellow-500 hover:shadow-sm transition-colors"
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
                <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Need a part for this JCB?</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    We&apos;ll pre-fill your make, model, and PIN so we can come back with accurate pricing — no account required.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={quoteHref}
                      className="inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 transition-colors"
                    >
                      Get a JCB parts quote
                    </a>
                    <a
                      href="/parts/construction-equipment-parts"
                      className="text-sm text-slate-700 underline hover:text-yellow-700"
                    >
                      Browse JCB parts
                    </a>
                    <a
                      href="tel:+18883929175"
                      className="text-sm text-slate-700 underline hover:text-yellow-700"
                    >
                      Or call (888) 392-9175
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Resources Section */}
              <section className="mt-8 p-4 bg-white rounded-xl border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    href="/osha-operator-training"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Equipment Training
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Certified operator courses
                    </div>
                  </a>
                  <a
                    href="/quote"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Get Parts Quote
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      JCB parts pricing
                    </div>
                  </a>
                  <a
                    href="/parts/construction-equipment-parts"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      JCB Parts
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Construction equipment parts
                    </div>
                  </a>
                  <a
                    href="/battery-chargers"
                    className="group p-3 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Battery Chargers
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Equipment battery solutions
                    </div>
                  </a>
                </div>
              </section>

              <section className="mt-8 text-sm text-slate-600">
                More lookups:{" "}
                <a className="underline" href="/toyota-forklift-serial-number-lookup">Toyota</a> ·{" "}
                <a className="underline" href="/hyster-serial-number-lookup">Hyster</a> ·{" "}
                <a className="underline" href="/yale-serial-number-lookup">Yale</a> ·{" "}
                <a className="underline" href="/cat-serial-number-lookup">CAT</a> ·{" "}
                <a className="underline" href="/komatsu-serial-number-lookup">Komatsu</a> ·{" "}
                <a className="underline" href="/clark-serial-number-lookup">Clark</a> ·{" "}
                <a className="underline" href="/mitsubishi-serial-number-lookup">Mitsubishi</a> ·{" "}
                <a className="underline" href="/doosan-serial-number-lookup">Doosan</a> ·{" "}
                <a className="underline" href="/raymond-serial-number-lookup">Raymond</a> ·{" "}
                <a className="underline" href="/genie-serial-number-lookup">Genie</a> ·{" "}
                <a className="underline" href="/bobcat-serial-number-lookup">Bobcat</a> ·{" "}
                <a className="underline" href="/unicarriers-serial-number-lookup">UniCarriers</a> ·{" "}
                <a className="underline" href="/jlg-serial-number-lookup">JLG</a>
              </section>
            </>
          )}
        </div>
      )}

      <BrandRubberTracksSection brand="jcb" brandLabel="JCB" />

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sources: JCB Machine Identification documentation, ConEquip Parts mini-excavator references, and dealer parts-catalog conventions.
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
    </>
  );
}
