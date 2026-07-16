import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Hash, Wrench, HelpCircle } from "lucide-react";
import BrandRubberTracksSection from "@/components/parts/BrandRubberTracksSection";

const PAGE_PATH =
  "/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup";
const PAGE_URL = `https://www.flatearthequipment.com${PAGE_PATH}`;

const TITLE =
  "John Deere Skid Steer PIN Lookup | Find & Decode Your Product ID";
const DESCRIPTION =
  "Find the product identification number (PIN) on your John Deere skid steer or compact track loader, understand what the plate shows, and use it to order the right parts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a John Deere PIN on a skid steer?",
    a: "The PIN (product identification number) is the machine ID stamped on the product identification plate. On modern John Deere skid steers and compact track loaders it is typically a 17-character code. Dealers and parts catalogs use that full PIN—not just the model name—to pick the correct revision of a part.",
  },
  {
    q: "Is the PIN the same as the serial number?",
    a: "Operators often say “serial number” when they mean the PIN on the machine plate. On current John Deere construction equipment the plate PIN is the ID you should give for parts. Engines, pumps, and other components also carry their own serials—record those separately when the part is engine- or component-specific.",
  },
  {
    q: "Where is the PIN plate on a John Deere skid steer or CTL?",
    a: "Check the left side of the main frame near the front, around the operator platform / ROPS structure, and behind or under the seat area. If the plate is painted over or missing, look for a stamped number in the frame near the same area and cross-check the operator’s manual data plate page for your model.",
  },
  {
    q: "Why do parts sellers ask for the full PIN instead of just the model?",
    a: "A single model line (for example 325G or 333G) can span mid-series hydraulic, harness, or attachment changes gated by PIN/serial break. Sending the full PIN from the plate reduces wrong-part orders.",
  },
  {
    q: "What if I cannot find or read the PIN?",
    a: "Send clear photos of the left frame, cab/ROPS area, and any remaining plate metal plus the model decal if visible. We can help narrow fitment from those clues, then confirm before you order.",
  },
];

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to find a John Deere skid steer PIN",
  description:
    "Locate the product identification plate on a John Deere skid steer or compact track loader and record the full PIN for parts ordering.",
  step: [
    {
      "@type": "HowToStep",
      name: "Park and shut down safely",
      text: "Lower the arms, shut the machine off, and remove the key before inspecting the frame or cab area.",
    },
    {
      "@type": "HowToStep",
      name: "Check the left frame and platform",
      text: "Inspect the left side of the main frame near the front wheel/track area and around the operator platform for the product identification plate.",
    },
    {
      "@type": "HowToStep",
      name: "Check the seat / ROPS area",
      text: "Look behind or under the seat and on the ROPS / cab structure for a second plate location common on skid steers and CTLs.",
    },
    {
      "@type": "HowToStep",
      name: "Record the full PIN",
      text: "Copy every character from the plate. For parts, send the full PIN plus your model (for example 317G, 325G, 331G, 333G).",
    },
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Parts",
      item: "https://www.flatearthequipment.com/parts",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "John Deere skid steer PIN lookup",
      item: PAGE_URL,
    },
  ],
};

export default function JohnDeerePINLookupPage() {
  return (
    <main id="main" className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/parts" className="hover:text-canyon-rust">
              Parts
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-slate-700">John Deere skid steer PIN lookup</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
        John Deere skid steer PIN lookup
      </h1>

      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
        Use this guide to find the product identification number (PIN) on your
        John Deere skid steer or compact track loader, understand what to send
        for parts, and skip wrong-fit orders. We ship parts nationwide from the
        U.S.—this page is a lookup and parts-fit guide, not on-site service.
      </p>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/parts"
          className="inline-flex items-center justify-center min-h-[44px] rounded-md bg-canyon-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
        >
          Browse parts
        </Link>
        <Link
          href="/quote?equipment=John%20Deere%20skid%20steer&notes=Need%20parts%20fitment%20help%20with%20PIN"
          className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-canyon-rust hover:text-canyon-rust transition"
        >
          Get a parts quote
        </Link>
      </div>

      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-6 h-6 text-canyon-rust shrink-0 mt-0.5" aria-hidden />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Where to find the PIN plate
            </h2>
            <p className="text-slate-600 mt-1 text-sm">
              Walk the machine in this order—most plates sit on the left side
              of the chassis or near the operator station.
            </p>
          </div>
        </div>
        <ol className="list-decimal pl-6 space-y-2 text-slate-700">
          <li>Left main frame near the front (wheel or track area)</li>
          <li>Around the operator platform / step and lower ROPS structure</li>
          <li>Behind or under the seat</li>
          <li>Cab / ROPS upright if your unit is enclosed</li>
          <li>
            Operator&apos;s manual data-plate page (backup if the plate is worn)
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate-600">
          Tip: wipe paint and dirt before photographing. A sharp photo of the
          full plate is often enough for parts fitment help.
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-start gap-3 mb-4">
          <Hash className="w-6 h-6 text-canyon-rust shrink-0 mt-0.5" aria-hidden />
          <h2 className="text-2xl font-semibold text-slate-900">
            What a John Deere PIN looks like
          </h2>
        </div>
        <div className="border border-slate-200 rounded-xl p-6 space-y-4">
          <p className="text-slate-700">
            On modern John Deere skid steers and compact track loaders, the
            machine PIN on the product identification plate is typically{" "}
            <strong>17 characters</strong> (letters and numbers, no spaces).
            Older units may show a shorter serial on the plate—still send every
            character exactly as stamped.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-800 break-all">
            Example shape (illustrative): 1T0325GXXXXX12345
          </div>
          <p className="text-sm text-slate-600">
            Do not invent year codes from a made-up pattern. Read the model and
            year fields printed on the plate itself, then use the full PIN when
            ordering filters, hydraulics, electrical, or rubber tracks.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="font-semibold">Also record the engine serial</strong>
            {" "}
            when the part is engine-related. The chassis PIN and engine serial
            are different plates.
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-start gap-3 mb-4">
          <Wrench className="w-6 h-6 text-canyon-rust shrink-0 mt-0.5" aria-hidden />
          <h2 className="text-2xl font-semibold text-slate-900">
            Common G-Series models we see for parts
          </h2>
        </div>
        <p className="text-slate-700 mb-4">
          Compact track loaders and skid steers in the G-Series family are
          frequent parts requests. Confirm fitment with your PIN—serial breaks
          matter even within one model.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 mb-4">
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">317G</li>
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">325G</li>
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">331G</li>
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">333G</li>
        </ul>
        <p className="text-sm text-slate-600">
          Looking for tracks? Open a model page below and check the listed
          serial prefixes before ordering.
        </p>
      </section>

      <BrandRubberTracksSection brand="john deere" brandLabel="John Deere" />

      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-10 mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Need help reading a worn plate?
        </h2>
        <p className="text-slate-600 mb-4 text-sm">
          Send your model, any readable PIN characters, and where you looked.
          Same-day response on U.S. business days for parts questions.
        </p>
        <form
          method="POST"
          action="https://usebasin.com/f/07a3bd02758b"
          className="space-y-4"
        >
          <input type="hidden" name="subject" value="John Deere Skid Steer PIN Help Request" />
          <input type="hidden" name="form_name" value="john_deere_pin_help" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Your name"
              required
              autoComplete="name"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-md min-h-[44px]"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-md min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="model"
              placeholder="Model (e.g. 325G, 333G)"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-md min-h-[44px]"
            />
            <input
              name="pin"
              placeholder="PIN (if readable)"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-md min-h-[44px]"
            />
          </div>

          <textarea
            name="message"
            placeholder="Where you looked for the plate, and what parts you need"
            rows={4}
            required
            className="w-full border border-slate-300 px-4 py-2.5 rounded-md"
          />

          <button
            type="submit"
            className="w-full min-h-[44px] bg-canyon-rust text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-700 transition"
          >
            Get help with PIN / parts fitment
          </button>

          <p className="text-sm text-slate-600">
            Parts shipped nationwide · U.S.-based support · No on-site repair claims
          </p>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Related parts resources
        </h2>
        <ul className="space-y-2 text-slate-800">
          <li>
            <Link href="/parts" className="text-canyon-rust font-medium hover:underline">
              Browse the parts catalog
            </Link>
          </li>
          <li>
            <Link href="/rubber-tracks" className="text-canyon-rust font-medium hover:underline">
              Shop rubber tracks by machine
            </Link>
          </li>
          <li>
            <Link
              href="/quote?equipment=John%20Deere%20skid%20steer"
              className="text-canyon-rust font-medium hover:underline"
            >
              Request a John Deere parts quote
            </Link>
          </li>
          <li>
            <Link href="/bobcat-serial-number-lookup" className="text-canyon-rust font-medium hover:underline">
              Bobcat serial number lookup
            </Link>
            {" · "}
            <Link href="/kubota-serial-number-lookup" className="text-canyon-rust font-medium hover:underline">
              Kubota serial number lookup
            </Link>
          </li>
        </ul>
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-canyon-rust shrink-0 mt-0.5" aria-hidden />
          <h2 className="text-xl font-semibold text-slate-900">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-slate-900">{f.q}</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
