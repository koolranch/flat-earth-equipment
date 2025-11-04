import { notFound } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { currency, parseSpecsFromSlug, shortDesc } from "@/lib/chargers";
import SpecTable from "@/components/SpecTable";
import RelatedChargers from "@/components/RelatedChargers";
import QuoteButton from "@/components/QuoteButton";
import { BuyNowButton } from "@/components/AddToCartButton";

export const revalidate = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Part = {
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  price: string | null;
  price_cents: number | null;
  sku: string | null;
  category_slug: string | null;
  stripe_price_id?: string | null;
};

async function getPart(slug: string): Promise<Part | null> {
  const { data, error } = await supabase
    .from("parts")
    .select("name,slug,brand,description,image_url,price,price_cents,sku,category_slug,stripe_price_id")
    .eq("slug", slug)
    .limit(1)
    .single();
  if (error) {
    console.error('Error fetching charger:', error);
    return null;
  }
  return data as Part;
}

function hasPrice(p: Part) {
  const n = p.price ? Number(p.price) : p.price_cents ?? 0;
  return !!n && !Number.isNaN(n) && n > 0;
}

function shouldNoIndex(p: Part) {
  // Guard: if BOTH image and price are missing, noindex to avoid thin pages
  return (!p.image_url || p.image_url.trim() === "") && !hasPrice(p);
}

function jsonLd(p: Part) {
  const specs = parseSpecsFromSlug(p.slug);
  const base: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku ?? undefined,
    brand: { "@type": "Brand", name: "FSIP" },
    category: "Battery Chargers",
    description: shortDesc(p.description, "FSIP GREEN Series industrial battery charger."),
    url: `https://www.flatearthequipment.com/chargers/${p.slug}`,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Family", value: specs.family?.toUpperCase() ?? "" },
      { "@type": "PropertyValue", name: "Voltage", value: specs.voltage ? `${specs.voltage} V` : "" },
      { "@type": "PropertyValue", name: "Current", value: specs.current ? `${specs.current} A` : "" },
      { "@type": "PropertyValue", name: "Phase", value: specs.phase ?? "" },
      { "@type": "PropertyValue", name: "Chemistries", value: "Lead-acid, AGM, Gel, Lithium" },
    ],
  };
  if (p.image_url) base.image = [p.image_url];

  // Only include offers if we have a price
  if (hasPrice(p)) {
    const priceNum = p.price ? Number(p.price) : (p.price_cents ?? 0) / 100;
    base.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceNum.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://www.flatearthequipment.com/chargers/${p.slug}`,
    };
  }
  return base;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const part = await getPart(params.slug);
  if (!part) return {};

  const specs = parseSpecsFromSlug(part.slug);
  const title = `${part.name} | FSIP GREEN Series Charger`;
  const desc =
    shortDesc(
      part.description,
      `FSIP GREEN Series industrial charger${specs.voltage ? ` • ${specs.voltage}V` : ""}${specs.current ? ` • ${specs.current}A` : ""}. Request a quote from Flat Earth Equipment.`
    );

  const robots = shouldNoIndex(part) ? { index: false, follow: false } : { index: true, follow: true };

  return {
    title,
    description: desc,
    robots,
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: part.image_url ? [{ url: part.image_url }] : undefined,
    },
    alternates: { canonical: `/chargers/${part.slug}` },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const part = await getPart(params.slug);
  if (!part) notFound();

  const specs = parseSpecsFromSlug(part.slug);
  const priceStr = currency(part.price ?? part.price_cents);

  const noindex = shouldNoIndex(part);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(part)) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>›</span>
          <a href="/parts" className="hover:text-gray-900 transition-colors">Parts</a>
          <span>›</span>
          <a href="/battery-chargers" className="hover:text-gray-900 transition-colors">Forklift Battery Chargers</a>
          <span>›</span>
          <span className="text-gray-900 font-medium">{part.name}</span>
        </nav>
        
        {/* Back to Chargers Button - Enhanced */}
        <a 
          href="/battery-chargers"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:shadow-sm border border-blue-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Browse All Chargers & Selector Tool
        </a>
      </div>

      {/* Prominent Info Banner - Selector Tool CTA */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Not sure if this is the right charger for your forklift?
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Use our free <strong>Interactive Charger Selector Tool</strong> to get personalized recommendations based on your battery voltage, charging speed needs, and facility power type.
            </p>
            <a 
              href="/battery-chargers#charger-selector"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Use Charger Selector Tool
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image / Media */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
            {part.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={part.image_url} alt={part.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <span className="text-sm">No image available</span>
              </div>
            )}
          </div>
          {noindex && (
            <p className="mt-3 text-xs text-amber-600">
              Heads up: This page is set to <code>noindex</code> until an image or price is added.
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{part.name}</h1>
          <p className="mt-2 text-neutral-700">
            {shortDesc(part.description, "FSIP GREEN Series industrial battery charger for lead-acid, AGM, gel, and lithium batteries.")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {specs.family && <span className="rounded-full bg-neutral-100 px-3 py-1">{specs.family.toUpperCase()}</span>}
            {specs.voltage && <span className="rounded-full bg-neutral-100 px-3 py-1">{specs.voltage} V</span>}
            {specs.current && <span className="rounded-full bg-neutral-100 px-3 py-1">{specs.current} A</span>}
            {specs.phase && <span className="rounded-full bg-neutral-100 px-3 py-1">{specs.phase}</span>}
            {part.sku && <span className="rounded-full bg-neutral-100 px-3 py-1">SKU: {part.sku}</span>}
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-4">
              <div className="text-xl font-semibold">
                {priceStr ? priceStr : <span className="text-neutral-500 text-base">Call for pricing</span>}
              </div>
              <BuyNowButton priceId={(part as any).stripe_price_id} slug={part.slug} />
              <QuoteButton product={{ name: part.name, slug: part.slug, sku: part.sku }} />
            </div>
            <p className="mt-3 text-sm text-gray-600">
              💼 <strong>Bulk orders or purchase order?</strong> Get volume pricing and NET-30 terms with a custom quote.
            </p>
          </div>

          <div className="mt-8">
            <SpecTable
              specs={{
                family: specs.family?.toUpperCase() ?? "UNKNOWN",
                voltage: specs.voltage ? `${specs.voltage} V` : "—",
                current: specs.current ? `${specs.current} A` : "—",
                phase: specs.phase ?? "—",
                chemistries: "Lead-acid, AGM, Gel, Lithium",
              }}
            />
            
            {/* Contextual Help Below Specs */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Need help understanding these specs?</span> Our{" "}
                <a href="/battery-chargers#charger-selector" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Charger Selector Tool
                </a>
                {" "}and{" "}
                <a href="/battery-chargers#faq" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  FAQ section
                </a>
                {" "}can help you choose the right specifications for your forklift.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Resources Section - Drive to Hub */}
      <div className="mt-16 mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Need Help Choosing the Right Charger?
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Our comprehensive charger hub has everything you need to make an informed decision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selector Tool Card */}
            <a 
              href="/battery-chargers#charger-selector"
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Interactive Selector
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Answer 3 questions and get personalized charger recommendations for your specific needs
              </p>
              <span className="text-sm font-medium text-blue-600 group-hover:underline">
                Try the selector →
              </span>
            </a>

            {/* Expert Guides Card */}
            <a 
              href="/battery-chargers#resources"
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <svg className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Expert Guides
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                15,000+ word comprehensive guides on voltage selection, installation, and maintenance
              </p>
              <span className="text-sm font-medium text-indigo-600 group-hover:underline">
                Read the guides →
              </span>
            </a>

            {/* FAQ Card */}
            <a 
              href="/battery-chargers#faq"
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Charger FAQ
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Get answers to common questions about amperage, voltage, charging times, and compatibility
              </p>
              <span className="text-sm font-medium text-green-600 group-hover:underline">
                View FAQ →
              </span>
            </a>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <a 
              href="/battery-chargers"
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              View Complete Charger Hub
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <RelatedChargers currentSlug={part.slug} />
      </div>
    </div>
  );
}


