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
        
        {/* Back to Chargers Button */}
        <a 
          href="/battery-chargers"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Browse All Chargers
        </a>
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
          </div>
        </div>
      </div>

      <div className="mt-12">
        <RelatedChargers currentSlug={part.slug} />
      </div>
    </div>
  );
}


