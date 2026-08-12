import { Metadata } from "next";
import Link from "next/link";
import { Hash, MapPin, Search, Wrench } from "lucide-react";
import { generatePageAlternates } from "@/app/seo-defaults";
import BrandRubberTracksSection from "@/components/parts/BrandRubberTracksSection";
import BrandCabGlassSection from "@/components/parts/BrandCabGlassSection";
import { getTrackLinksForBrand } from "@/lib/parts/rubberTrackLinks";

const PAGE_PATH =
  "/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it";
const PAGE_URL = `https://www.flatearthequipment.com${PAGE_PATH}`;

/** Stocked Bobcat track PDPs keyed by model — used for in-table deep links */
const BOBCAT_TRACK_SLUG_BY_MODEL = Object.fromEntries(
  getTrackLinksForBrand("bobcat").map((l) => [l.model, l.slug])
);

function TrackModelCell({ model }: { model: string }) {
  const slug = BOBCAT_TRACK_SLUG_BY_MODEL[model];
  if (!slug) {
    return <td className="border p-2 font-semibold">{model}</td>;
  }
  return (
    <td className="border p-2 font-semibold">
      <Link
        href={`/parts/${slug}`}
        className="text-canyon-rust underline-offset-2 hover:underline"
      >
        {model}
      </Link>
      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
        tracks in stock
      </span>
    </td>
  );
}

/**
 * SEO LOCK — do not change without an explicit ranking review:
 * - URL / PAGE_PATH
 * - title, description, keywords
 * - openGraph title + description
 * - H1 text below
 * - Core FAQ question strings (answers may tighten wording only)
 */
export const metadata: Metadata = {
  title:
    "Bobcat Serial Number Lookup: Find Year by Serial + Model Year Table | Flat Earth Equipment",
  description:
    "Complete Bobcat serial number lookup guide with model year table (1999-2024). Find your Bobcat's year, decode serial numbers, and locate identification plates. Rentals available in WY, MT, CO, AZ, NM, TX.",
  keywords: [
    "bobcat serial number lookup",
    "bobcat serial number year",
    "what year is my bobcat",
    "bobcat model year chart",
    "bobcat serial number decoder",
    "bobcat skid steer serial number",
  ],
  alternates: generatePageAlternates(PAGE_PATH),
  openGraph: {
    title: "Bobcat Serial Number Lookup: Complete Model Year Table & Decoder",
    description:
      "Decode your Bobcat serial number instantly. Complete model year table from 1999-2024 with serial number ranges for skid steers, track loaders, and excavators.",
    type: "article",
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where is the serial number on a Bobcat skid steer?",
    a: "On R-Series loaders (2020+), check the right side rear above the tailgate. M-Series (2010+) have it on the right side of the main frame below the cooling compartment. K-Series (2007-2014) have it on the rear frame upright. Older models vary—check inside or outside the rear upright.",
  },
  {
    q: "How do I find what year my Bobcat is?",
    a: "The model year is printed directly on the product identification plate alongside the serial number. If the plate is missing or damaged, contact Bobcat customer service at 1-800-743-4340 with your serial number and they can provide the year.",
  },
  {
    q: "What do the numbers in a Bobcat serial number mean?",
    a: "Bobcat serial numbers are 9 digits: the first 4 digits identify the model number and engine combination (helping identify exact parts compatibility), while the last 5 digits are the production sequence number showing when your machine was built in the production run.",
  },
  {
    q: "Can I look up Bobcat parts by serial number?",
    a: "Yes. Bobcat parts catalogs are serial-driven, so the full 9-digit serial (not just the model year) is what dealers and catalogs use for correct fitment. Use our interactive Bobcat serial lookup for plate tips and matching parts, or send your model and serial on a parts quote.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Find Your Bobcat Serial Number",
  description:
    "Step-by-step guide to locating and decoding your Bobcat equipment serial number",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      name: "Locate the serial number plate",
      text: "Find the product identification plate on your Bobcat. Location varies by series: R-Series is on the right rear, M-Series is below the cooling compartment, K-Series is on the rear frame upright.",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "Read the 9-digit serial number",
      text: "The serial number is 9 digits: first 4 digits = model/engine code, last 5 digits = production sequence.",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "Note the model year",
      text: "The model year is printed directly on the identification plate alongside the serial number.",
      position: 3,
    },
  ],
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
      name: "Construction equipment parts",
      item: "https://www.flatearthequipment.com/parts/construction-equipment-parts",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Bobcat serial number lookup",
      item: PAGE_URL,
    },
  ],
};

function SerialAnatomyDiagram() {
  return (
    <figure className="my-8 not-prose rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <figcaption className="mb-4 text-sm font-semibold text-slate-900">
        How a Bobcat serial number is structured
      </figcaption>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
        <div className="rounded-lg border-2 border-red-600 bg-white px-4 py-3 text-center shadow-sm">
          <div className="font-mono text-2xl font-bold tracking-wider text-slate-900 sm:text-3xl">
            A3NW
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-700">
            Module code (4)
          </div>
          <p className="mt-1 text-xs text-slate-600">Model + engine combination</p>
        </div>
        <div
          className="hidden px-3 text-2xl font-light text-slate-300 sm:block"
          aria-hidden
        >
          +
        </div>
        <div className="rounded-lg border-2 border-slate-700 bg-white px-4 py-3 text-center shadow-sm">
          <div className="font-mono text-2xl font-bold tracking-wider text-slate-900 sm:text-3xl">
            14001
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Production sequence (5)
          </div>
          <p className="mt-1 text-xs text-slate-600">Build order in the run</p>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-sm text-slate-700">
        Full serial example:{" "}
        <span className="font-bold text-slate-900">A3NW14001</span>
      </p>
      <p className="mt-2 text-center text-xs text-slate-500">
        Illustrative example only — year is printed on the plate, not encoded in
        these digits.
      </p>
    </figure>
  );
}

function PlateLocationDiagram() {
  return (
    <figure className="my-8 not-prose overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <figcaption className="text-sm font-semibold text-slate-900">
          Plate location by loader generation (right side of machine)
        </figcaption>
      </div>
      <div className="grid gap-0 sm:grid-cols-3">
        {[
          {
            series: "R-Series",
            years: "2020–present",
            spot: "Right rear, above upper-right tailgate corner",
          },
          {
            series: "M-Series",
            years: "2010–2020",
            spot: "Right main frame, below cooling compartment",
          },
          {
            series: "K-Series",
            years: "2007–2014",
            spot: "Rear frame upright (right or left)",
          },
        ].map((item) => (
          <div
            key={item.series}
            className="border-t border-slate-200 p-5 sm:border-t-0 sm:border-l sm:first:border-l-0"
          >
            <div className="mb-3 flex h-28 items-end justify-center rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 px-3 pb-2">
              {/* Simple silhouette — educational marker, not a photo */}
              <svg
                viewBox="0 0 160 72"
                className="h-16 w-full text-slate-600"
                aria-hidden
              >
                <rect x="28" y="22" width="88" height="34" rx="3" fill="currentColor" opacity="0.18" />
                <rect x="40" y="8" width="52" height="22" rx="2" fill="currentColor" opacity="0.28" />
                <circle cx="48" cy="58" r="10" fill="currentColor" opacity="0.35" />
                <circle cx="112" cy="58" r="10" fill="currentColor" opacity="0.35" />
                <rect x="8" y="36" width="24" height="10" rx="1" fill="currentColor" opacity="0.4" />
                {/* Marker near right rear for all generations (approximate) */}
                <circle cx="118" cy="30" r="7" fill="#c2410c" />
                <text
                  x="118"
                  y="33"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="white"
                >
                  SN
                </text>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">{item.series}</h3>
            <p className="text-xs font-medium text-canyon-rust">{item.years}</p>
            <p className="mt-2 text-sm text-slate-600">{item.spot}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
        Compact excavators: R-Series plate is on the front of the cab beside the
        boom; M-Series is near the door beside the boom. See the full chart below.
      </p>
    </figure>
  );
}

export default function BobcatSerialNumberGuide() {
  return (
    <>
      {/*
        Server-rendered JSON-LD via raw <script> tags so the structured data
        lands in the initial HTML response for crawlers (next/script with
        afterInteractive defers until after hydration).
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/parts" className="hover:text-canyon-rust">
                Parts
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/parts/construction-equipment-parts"
                className="hover:text-canyon-rust"
              >
                Construction equipment parts
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">Bobcat serial number lookup</li>
          </ol>
        </nav>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900">
          Bobcat Serial Number Lookup: Find Year by Serial Number
        </h1>

        {/* Quick Answer Box for Featured Snippet — keep early, keep facts */}
        <div className="not-prose mb-8 rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Quick Answer: Bobcat Serial Number Location
          </h2>
          <p className="mb-4 text-slate-700">
            <strong>Bobcat serial numbers are 9 digits</strong> split into two
            parts: the first 4 digits identify the model/engine combination, and
            the last 5 are the production sequence. The{" "}
            <strong>model year is printed directly on the identification plate</strong>.
          </p>
          <p className="text-slate-700">
            <strong>Where to find it:</strong> R-Series (2020+) → right side rear
            above tailgate. M-Series (2010+) → right side of main frame. K-Series
            (2007-2014) → rear frame upright. For exact parts fit, always use the
            serial number—not just the model year.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/bobcat-serial-number-lookup"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Search className="h-4 w-4" aria-hidden />
            Open interactive Bobcat decoder
          </Link>
          <Link
            href="/quote?equipment=Bobcat&notes=Need%20parts%20fitment%20help%20with%20serial%20number"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-canyon-rust hover:text-canyon-rust"
          >
            Get a Bobcat parts quote
          </Link>
        </div>

        <p className="mb-8 text-lg leading-relaxed text-slate-600">
          This guide shows where to find the product identification plate, how
          to read the 9-digit (4+5) serial, and how to use published serial
          ranges to estimate model year. We ship Bobcat parts nationwide from
          the U.S.—use the serial for filters, hydraulics, rubber tracks, cab
          glass, and other fitment-sensitive parts.
        </p>

        <div className="prose prose-slate max-w-none">
          <p className="lead">
            Bobcat machines print the{" "}
            <strong>model year on the product identification plate</strong>. The
            serial itself typically follows a <strong>9-digit (4+5)</strong>{" "}
            structure: the first 4 digits identify the module (model/engine
            combination) and the last 5 digits are the production sequence. For
            parts accuracy, use your <strong>serial number</strong>—not just
            model year.
          </p>

          <h2>Where to Find Your Bobcat&apos;s Serial Number</h2>
          <p>
            When you need parts, service history, or insurance documentation,
            the serial on the product identification plate is the ID that
            catalogs and dealers use. Location depends on equipment family and
            generation—start with the chart and diagrams below before calling a
            dealer.
          </p>

          <PlateLocationDiagram />

          <div className="not-prose my-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-canyon-rust">
                <MapPin className="h-5 w-5" aria-hidden />
                <h3 className="m-0 text-base font-bold text-slate-900">
                  On the machine
                </h3>
              </div>
              <p className="m-0 text-sm text-slate-600">
                Check the product identification plate on the frame or cab (see
                series chart). Wipe paint and dirt before photographing every
                character.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-canyon-rust">
                <Hash className="h-5 w-5" aria-hidden />
                <h3 className="m-0 text-base font-bold text-slate-900">
                  In the operator&apos;s manual
                </h3>
              </div>
              <p className="m-0 text-sm text-slate-600">
                Many manuals include a data-plate / machine information page
                where the dealer or owner recorded the serial at delivery.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-canyon-rust">
                <Wrench className="h-5 w-5" aria-hidden />
                <h3 className="m-0 text-base font-bold text-slate-900">
                  Through Bobcat support
                </h3>
              </div>
              <p className="m-0 text-sm text-slate-600">
                If the plate is missing or unreadable, Bobcat Customer Service
                (1-800-743-4340) can often help from ownership records or other
                identifiers.
              </p>
            </div>
          </div>

          <h2>Understanding the Serial Number Plate</h2>
          <p>
            The typical Bobcat machine serial is nine characters split as{" "}
            <strong>4 + 5</strong>. The first four digits are the module code
            (model and engine combination). The last five are the production
            sequence. Year is printed on the plate itself—it is not reliably
            encoded in those nine digits.
          </p>

          <SerialAnatomyDiagram />

          <h2>Serial Number Location Chart by Series</h2>
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2">Series</th>
                  <th className="border p-2">Years</th>
                  <th className="border p-2">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold">R-Series Loaders</td>
                  <td className="border p-2">2020-Present</td>
                  <td className="border p-2">
                    Right side rear, above upper-right tailgate corner
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">M-Series Loaders</td>
                  <td className="border p-2">2010-2020</td>
                  <td className="border p-2">
                    Right side of main frame, below cooling compartment
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">K-Series Loaders</td>
                  <td className="border p-2">2007-2014</td>
                  <td className="border p-2">
                    Rear frame upright (right or left side)
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">
                    Older Loaders (40-80 Series)
                  </td>
                  <td className="border p-2">Pre-2007</td>
                  <td className="border p-2">
                    Inside or outside rear upright (varies)
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">
                    R-Series Excavators
                  </td>
                  <td className="border p-2">2017-Present</td>
                  <td className="border p-2">Front of cab, beside the boom</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">
                    M-Series Excavators
                  </td>
                  <td className="border p-2">2010-2017</td>
                  <td className="border p-2">
                    Front of cab near door, beside boom
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">
                    Small Articulated Loaders
                  </td>
                  <td className="border p-2">All Years</td>
                  <td className="border p-2">Lower frame on the entry side</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">Mini Track Loaders</td>
                  <td className="border p-2">All Years</td>
                  <td className="border p-2">
                    Left side main frame, near lift arm top
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">
                    Compact Wheel Loaders
                  </td>
                  <td className="border p-2">All Years</td>
                  <td className="border p-2">Left side, underneath lift arm</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">Telehandlers</td>
                  <td className="border p-2">All Years</td>
                  <td className="border p-2">
                    Machine frame near right front tire
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="model-year-table">
            Bobcat Model Year Table by Serial Number Range
          </h2>
          <p>
            Use this table to identify your Bobcat&apos;s approximate model year
            based on published serial number ranges. Coverage focuses on popular
            skid steer, compact track loader, and excavator models from recent
            years. Always confirm year on the plate when it is readable.
          </p>

          <h3>Skid Steer Loaders (S-Series) Model Year Chart</h3>
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-red-100">
                  <th className="border p-2">Model</th>
                  <th className="border p-2">2019</th>
                  <th className="border p-2">2020</th>
                  <th className="border p-2">2021</th>
                  <th className="border p-2">2022</th>
                  <th className="border p-2">2023</th>
                  <th className="border p-2">2024</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold">S450</td>
                  <td className="border p-2">B3BT11001+</td>
                  <td className="border p-2">B3BT14001+</td>
                  <td className="border p-2">B3BT17001+</td>
                  <td className="border p-2">B3BT20001+</td>
                  <td className="border p-2">B3BT23001+</td>
                  <td className="border p-2">B3BT26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S510</td>
                  <td className="border p-2">A3NJ11001+</td>
                  <td className="border p-2">A3NJ14001+</td>
                  <td className="border p-2">A3NJ17001+</td>
                  <td className="border p-2">A3NJ20001+</td>
                  <td className="border p-2">A3NJ23001+</td>
                  <td className="border p-2">A3NJ26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S530</td>
                  <td className="border p-2">A3NL11001+</td>
                  <td className="border p-2">A3NL14001+</td>
                  <td className="border p-2">A3NL17001+</td>
                  <td className="border p-2">A3NL20001+</td>
                  <td className="border p-2">A3NL23001+</td>
                  <td className="border p-2">A3NL26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S550</td>
                  <td className="border p-2">A3NK11001+</td>
                  <td className="border p-2">A3NK14001+</td>
                  <td className="border p-2">A3NK17001+</td>
                  <td className="border p-2">A3NK20001+</td>
                  <td className="border p-2">A3NK23001+</td>
                  <td className="border p-2">A3NK26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S570</td>
                  <td className="border p-2">A3NT11001+</td>
                  <td className="border p-2">A3NT14001+</td>
                  <td className="border p-2">A3NT17001+</td>
                  <td className="border p-2">A3NT20001+</td>
                  <td className="border p-2">A3NT23001+</td>
                  <td className="border p-2">A3NT26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S590</td>
                  <td className="border p-2">A3NU11001+</td>
                  <td className="border p-2">A3NU14001+</td>
                  <td className="border p-2">A3NU17001+</td>
                  <td className="border p-2">A3NU20001+</td>
                  <td className="border p-2">A3NU23001+</td>
                  <td className="border p-2">A3NU26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S630</td>
                  <td className="border p-2">A3NV11001+</td>
                  <td className="border p-2">A3NV14001+</td>
                  <td className="border p-2">A3NV17001+</td>
                  <td className="border p-2">A3NV20001+</td>
                  <td className="border p-2">A3NV23001+</td>
                  <td className="border p-2">A3NV26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S650</td>
                  <td className="border p-2">A3NW11001+</td>
                  <td className="border p-2">A3NW14001+</td>
                  <td className="border p-2">A3NW17001+</td>
                  <td className="border p-2">A3NW20001+</td>
                  <td className="border p-2">A3NW23001+</td>
                  <td className="border p-2">A3NW26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S740</td>
                  <td className="border p-2">B3CA11001+</td>
                  <td className="border p-2">B3CA14001+</td>
                  <td className="border p-2">B3CA17001+</td>
                  <td className="border p-2">B3CA20001+</td>
                  <td className="border p-2">B3CA23001+</td>
                  <td className="border p-2">B3CA26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S770</td>
                  <td className="border p-2">A3P411001+</td>
                  <td className="border p-2">A3P414001+</td>
                  <td className="border p-2">A3P417001+</td>
                  <td className="border p-2">A3P420001+</td>
                  <td className="border p-2">A3P423001+</td>
                  <td className="border p-2">A3P426001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">S850</td>
                  <td className="border p-2">A3P611001+</td>
                  <td className="border p-2">A3P614001+</td>
                  <td className="border p-2">A3P617001+</td>
                  <td className="border p-2">A3P620001+</td>
                  <td className="border p-2">A3P623001+</td>
                  <td className="border p-2">A3P626001+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Compact Track Loaders (T-Series) Model Year Chart</h3>
          <p className="text-sm text-slate-600">
            Linked models have rubber tracks in stock — confirm serial prefixes on
            the product page before ordering.
          </p>
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-orange-100">
                  <th className="border p-2">Model</th>
                  <th className="border p-2">2019</th>
                  <th className="border p-2">2020</th>
                  <th className="border p-2">2021</th>
                  <th className="border p-2">2022</th>
                  <th className="border p-2">2023</th>
                  <th className="border p-2">2024</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TrackModelCell model="T450" />
                  <td className="border p-2">B3BU11001+</td>
                  <td className="border p-2">B3BU14001+</td>
                  <td className="border p-2">B3BU17001+</td>
                  <td className="border p-2">B3BU20001+</td>
                  <td className="border p-2">B3BU23001+</td>
                  <td className="border p-2">B3BU26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T550" />
                  <td className="border p-2">A3NK11001+</td>
                  <td className="border p-2">A3NK14001+</td>
                  <td className="border p-2">A3NK17001+</td>
                  <td className="border p-2">A3NK20001+</td>
                  <td className="border p-2">A3NK23001+</td>
                  <td className="border p-2">A3NK26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T590" />
                  <td className="border p-2">A3NU11001+</td>
                  <td className="border p-2">A3NU14001+</td>
                  <td className="border p-2">A3NU17001+</td>
                  <td className="border p-2">A3NU20001+</td>
                  <td className="border p-2">A3NU23001+</td>
                  <td className="border p-2">A3NU26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T595" />
                  <td className="border p-2">B3Y911001+</td>
                  <td className="border p-2">B3Y914001+</td>
                  <td className="border p-2">B3Y917001+</td>
                  <td className="border p-2">B3Y920001+</td>
                  <td className="border p-2">B3Y923001+</td>
                  <td className="border p-2">B3Y926001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T630" />
                  <td className="border p-2">A3NV11001+</td>
                  <td className="border p-2">A3NV14001+</td>
                  <td className="border p-2">A3NV17001+</td>
                  <td className="border p-2">A3NV20001+</td>
                  <td className="border p-2">A3NV23001+</td>
                  <td className="border p-2">A3NV26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T650" />
                  <td className="border p-2">A3NW11001+</td>
                  <td className="border p-2">A3NW14001+</td>
                  <td className="border p-2">A3NW17001+</td>
                  <td className="border p-2">A3NW20001+</td>
                  <td className="border p-2">A3NW23001+</td>
                  <td className="border p-2">A3NW26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T740" />
                  <td className="border p-2">B3CA11001+</td>
                  <td className="border p-2">B3CA14001+</td>
                  <td className="border p-2">B3CA17001+</td>
                  <td className="border p-2">B3CA20001+</td>
                  <td className="border p-2">B3CA23001+</td>
                  <td className="border p-2">B3CA26001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T770" />
                  <td className="border p-2">A3P411001+</td>
                  <td className="border p-2">A3P414001+</td>
                  <td className="border p-2">A3P417001+</td>
                  <td className="border p-2">A3P420001+</td>
                  <td className="border p-2">A3P423001+</td>
                  <td className="border p-2">A3P426001+</td>
                </tr>
                <tr>
                  <TrackModelCell model="T870" />
                  <td className="border p-2">A3P611001+</td>
                  <td className="border p-2">A3P614001+</td>
                  <td className="border p-2">A3P617001+</td>
                  <td className="border p-2">A3P620001+</td>
                  <td className="border p-2">A3P623001+</td>
                  <td className="border p-2">A3P626001+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Compact Excavators (E-Series) Model Year Chart</h3>
          <div className="mb-8 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="border p-2">Model</th>
                  <th className="border p-2">2019</th>
                  <th className="border p-2">2020</th>
                  <th className="border p-2">2021</th>
                  <th className="border p-2">2022</th>
                  <th className="border p-2">2023</th>
                  <th className="border p-2">2024</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold">E10</td>
                  <td className="border p-2">B4SB11001+</td>
                  <td className="border p-2">B4SB14001+</td>
                  <td className="border p-2">B4SB17001+</td>
                  <td className="border p-2">B4SB20001+</td>
                  <td className="border p-2">B4SB23001+</td>
                  <td className="border p-2">B4SB26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E20</td>
                  <td className="border p-2">B3YL11001+</td>
                  <td className="border p-2">B3YL14001+</td>
                  <td className="border p-2">B3YL17001+</td>
                  <td className="border p-2">B3YL20001+</td>
                  <td className="border p-2">B3YL23001+</td>
                  <td className="border p-2">B3YL26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E32</td>
                  <td className="border p-2">A94H11001+</td>
                  <td className="border p-2">A94H14001+</td>
                  <td className="border p-2">A94H17001+</td>
                  <td className="border p-2">A94H20001+</td>
                  <td className="border p-2">A94H23001+</td>
                  <td className="border p-2">A94H26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E35</td>
                  <td className="border p-2">A94K11001+</td>
                  <td className="border p-2">A94K14001+</td>
                  <td className="border p-2">A94K17001+</td>
                  <td className="border p-2">A94K20001+</td>
                  <td className="border p-2">A94K23001+</td>
                  <td className="border p-2">A94K26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E42</td>
                  <td className="border p-2">B3E811001+</td>
                  <td className="border p-2">B3E814001+</td>
                  <td className="border p-2">B3E817001+</td>
                  <td className="border p-2">B3E820001+</td>
                  <td className="border p-2">B3E823001+</td>
                  <td className="border p-2">B3E826001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E50</td>
                  <td className="border p-2">A93W11001+</td>
                  <td className="border p-2">A93W14001+</td>
                  <td className="border p-2">A93W17001+</td>
                  <td className="border p-2">A93W20001+</td>
                  <td className="border p-2">A93W23001+</td>
                  <td className="border p-2">A93W26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E55</td>
                  <td className="border p-2">A93Y11001+</td>
                  <td className="border p-2">A93Y14001+</td>
                  <td className="border p-2">A93Y17001+</td>
                  <td className="border p-2">A93Y20001+</td>
                  <td className="border p-2">A93Y23001+</td>
                  <td className="border p-2">A93Y26001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E60</td>
                  <td className="border p-2">B4M211001+</td>
                  <td className="border p-2">B4M214001+</td>
                  <td className="border p-2">B4M217001+</td>
                  <td className="border p-2">B4M220001+</td>
                  <td className="border p-2">B4M223001+</td>
                  <td className="border p-2">B4M226001+</td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold">E85</td>
                  <td className="border p-2">A3C611001+</td>
                  <td className="border p-2">A3C614001+</td>
                  <td className="border p-2">A3C617001+</td>
                  <td className="border p-2">A3C620001+</td>
                  <td className="border p-2">A3C623001+</td>
                  <td className="border p-2">A3C626001+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Money-page next steps — hubs only, keep educational intent primary */}
        <aside className="not-prose my-10 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Found your serial? Next steps
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use the serial to confirm fitment, then shop the parts we stock for
            Bobcat machines.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/rubber-tracks"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-canyon-rust px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Shop rubber tracks
            </Link>
            <Link
              href="/cab-glass"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-canyon-rust hover:text-canyon-rust"
            >
              Shop cab glass
            </Link>
            <Link
              href="/quote?equipment=Bobcat&notes=Have%20serial%20ready%20for%20parts%20fitment"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-canyon-rust hover:text-canyon-rust"
            >
              Parts quote
            </Link>
          </div>
        </aside>

        {/* Soft-sell live catalog — educate first, then shoppable links */}
        <BrandRubberTracksSection brand="bobcat" brandLabel="Bobcat" />
        <BrandCabGlassSection brand="bobcat" brandLabel="Bobcat" />

        <div className="prose prose-slate mt-10 max-w-none">
          <h2>Why You Need the Serial Number</h2>
          <p>
            The serial is the fingerprint parts catalogs use. Mid-series changes
            (hydraulics, harnesses, pumps, cab glass, track size) are often gated
            by serial break—even within one model year.
          </p>

          <h3>Maintenance records</h3>
          <p>
            Service history, warranty claims, and recall lookups are keyed to
            the machine serial. Keep a photo of the plate with your maintenance
            file.
          </p>

          <h3>Parts ordering</h3>
          <p>
            Ordering by model name alone is a common source of wrong-fit returns.
            Send the full 9-digit serial plus model (for example T650 / A3NW…)
            when requesting filters, seals, glass, or rubber tracks.
          </p>

          <h3>Insurance and registration</h3>
          <p>
            Insurers and title paperwork typically require the serial from the
            product identification plate as the equipment identifier.
          </p>

          <div className="not-prose my-8 rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              Have your serial ready?
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Decode module code, get plate tips, and see matching parts from
              inventory.
            </p>
            <Link
              className="inline-flex min-h-[44px] items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              href="/bobcat-serial-number-lookup"
            >
              Open the Bobcat Serial Number Lookup
            </Link>
          </div>

          <h2>Why Serial Beats &quot;Model Year&quot; for Parts</h2>
          <p>
            Bobcat parts catalogs are serial-driven. Year-only lookups can miss
            mid-series changes. Use the serial for precise fit.
          </p>

          <h2>Conclusion</h2>
          <p>
            Locate the product identification plate, record all nine digits and
            the printed model year, then use that serial for parts and service.
            If the plate is damaged, contact Bobcat Customer Service at
            1-800-743-4340, or send us a photo and your model for a parts
            fitment quote.
          </p>

          <h2>Frequently Asked Questions</h2>

          {FAQS.map((item) => (
            <div key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Need Bobcat parts?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-slate-300">
            Flat Earth Equipment ships Bobcat parts across the U.S. Include your
            model and full serial for faster, accurate fitment—especially on
            rubber tracks and cab glass.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/quote?equipment=Bobcat&notes=Have%20serial%20ready%20for%20parts%20fitment"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-red-700"
            >
              Get a parts quote →
            </Link>
            <Link
              href="/bobcat-serial-number-lookup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-slate-900 transition-all hover:bg-slate-100"
            >
              Try serial number decoder
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
