import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import { BuyNowButton } from "@/components/AddToCartButton";
import QuoteButton from "@/components/QuoteButton";
import RelatedChargers from "@/components/RelatedChargers";

export const revalidate = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type PartsCatalog = {
  id: string;
  sku: string;
  name: string;
  category_type: "charger" | "part" | "attachment";
  slug: string;
  seo_title_template: string | null;
  meta_description: string | null;
  specs: Record<string, string | number | boolean> | null;
  compatibility_list: string[] | null;
  oem_part_numbers: string[] | null;
  images: string[] | null;
  manual_pdf_url: string | null;
  fsip_price: number | null;
  your_price: number | null;
  in_stock: boolean | null;
  created_at: string;
};

// -----------------------------------------------------------------------------
// Data Fetching
// -----------------------------------------------------------------------------
async function getProduct(slug: string): Promise<PartsCatalog | null> {
  const { data, error } = await supabase
    .from("parts_catalog")
    .select("*")
    .eq("slug", slug)
    .eq("category_type", "charger")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching charger from parts_catalog:", error);
    return null;
  }
  return data as PartsCatalog;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function currency(price: number | null | undefined): string | null {
  if (price === null || price === undefined || price <= 0) return null;
  return price.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function shortDesc(s: string | null | undefined, fallback: string): string {
  if (!s || !s.trim()) return fallback;
  return s.length > 180 ? s.slice(0, 177) + "..." : s;
}

function shouldNoIndex(p: PartsCatalog): boolean {
  // Guard: if BOTH images are missing AND no price, noindex to avoid thin pages
  const hasImage = p.images && p.images.length > 0;
  const hasPrice = p.fsip_price !== null && p.fsip_price > 0;
  return !hasImage && !hasPrice;
}

// -----------------------------------------------------------------------------
// JSON-LD Schema Generator
// -----------------------------------------------------------------------------
function generateJsonLd(p: PartsCatalog) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    brand: { "@type": "Brand", name: "FSIP" },
    category: "Battery Chargers",
    description: shortDesc(
      p.meta_description,
      "FSIP industrial battery charger for forklift applications."
    ),
    url: `https://www.flatearthequipment.com/chargers/${p.slug}`,
  };

  // Add images if available
  if (p.images && p.images.length > 0) {
    base.image = p.images;
  }

  // Map specs (JSONB) to additionalProperty
  if (p.specs && typeof p.specs === "object") {
    const additionalProperties = Object.entries(p.specs).map(([key, value]) => ({
      "@type": "PropertyValue",
      name: key,
      value: String(value),
    }));
    if (additionalProperties.length > 0) {
      base.additionalProperty = additionalProperties;
    }
  }

  // Add offers with fsip_price
  if (p.fsip_price !== null && p.fsip_price > 0) {
    base.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.fsip_price.toFixed(2),
      availability: p.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://www.flatearthequipment.com/chargers/${p.slug}`,
    };
  }

  return base;
}

// -----------------------------------------------------------------------------
// Metadata (SEO)
// -----------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  const title = `${product.name} | ${product.seo_title_template || "FSIP Series"}`;
  const description = shortDesc(
    product.meta_description,
    `${product.name} industrial battery charger from FSIP. Request a quote from Flat Earth Equipment.`
  );

  const robots = shouldNoIndex(product)
    ? { index: false, follow: false }
    : { index: true, follow: true };

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
    alternates: { canonical: `/chargers/${params.slug}` },
  };
}

// -----------------------------------------------------------------------------
// Dynamic Specs Table Component
// -----------------------------------------------------------------------------
function DynamicSpecTable({ specs }: { specs: Record<string, string | number | boolean> | null }) {
  if (!specs || Object.keys(specs).length === 0) {
    return null;
  }

  const rows = Object.entries(specs);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <table className="w-full border-separate border-spacing-0">
        <tbody>
          {rows.map(([key, value], i) => (
            <tr key={key} className={i % 2 ? "bg-neutral-50" : ""}>
              <td className="w-48 border-b px-4 py-3 text-sm font-medium text-neutral-700">
                {key}
              </td>
              <td className="border-b px-4 py-3 text-sm text-neutral-800">
                {String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Compatibility List Component (Searchable)
// -----------------------------------------------------------------------------
function CompatibilityList({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Compatible Equipment
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search compatible models..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            id="compatibility-search"
          />
        </div>
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto"
          id="compatibility-list"
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="compatibility-item px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              data-search={item.toLowerCase()}
            >
              {item}
            </li>
          ))}
        </ul>
        {items.length > 10 && (
          <p className="mt-3 text-xs text-gray-500">
            Showing {items.length} compatible models
          </p>
        )}
      </div>
      {/* Client-side search script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var searchInput = document.getElementById('compatibility-search');
              var listItems = document.querySelectorAll('.compatibility-item');
              if (searchInput && listItems.length) {
                searchInput.addEventListener('input', function(e) {
                  var query = e.target.value.toLowerCase();
                  listItems.forEach(function(item) {
                    var searchText = item.getAttribute('data-search') || '';
                    item.style.display = searchText.includes(query) ? '' : 'none';
                  });
                });
              }
            })();
          `,
        }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------
export default async function Page({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const priceStr = currency(product.fsip_price);
  const noindex = shouldNoIndex(product);
  const primaryImage = product.images?.[0] ?? null;

  return (
    <main id="main" role="main">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(product)) }}
        />

        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-gray-900 transition-colors">
              Home
            </a>
            <span>›</span>
            <a href="/parts" className="hover:text-gray-900 transition-colors">
              Parts
            </a>
            <span>›</span>
            <a href="/battery-chargers" className="hover:text-gray-900 transition-colors">
              Forklift Battery Chargers
            </a>
            <span>›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          {/* Back to Chargers Button */}
          <a
            href="/battery-chargers"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:shadow-sm border border-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Browse All Chargers &amp; Selector Tool
          </a>
        </div>

        {/* Selector Tool Banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Not sure if this is the right charger for your forklift?
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Use our free <strong>Interactive Charger Selector Tool</strong> to get personalized
                recommendations based on your battery voltage, charging speed needs, and facility
                power type.
              </p>
              <a
                href="/battery-chargers#charger-selector"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Use Charger Selector Tool
              </a>
            </div>
          </div>
        </div>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Image / Media */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>
            {/* Image Gallery (if multiple) */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} view ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {noindex && (
              <p className="mt-3 text-xs text-amber-600">
                Heads up: This page is set to <code>noindex</code> until an image or price is added.
              </p>
            )}
          </div>

          {/* Product Content */}
          <div>
            {/* H1: Display ONLY product.name */}
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>

            {/* Description */}
            <p className="mt-2 text-neutral-700">
              {shortDesc(
                product.meta_description,
                "FSIP industrial battery charger for lead-acid, AGM, gel, and lithium batteries."
              )}
            </p>

            {/* Tags / Quick Specs */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {product.sku && (
                <span className="rounded-full bg-neutral-100 px-3 py-1">SKU: {product.sku}</span>
              )}
              {product.oem_part_numbers && product.oem_part_numbers.length > 0 && (
                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1">
                  OEM: {product.oem_part_numbers[0]}
                  {product.oem_part_numbers.length > 1 && ` +${product.oem_part_numbers.length - 1}`}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              {product.in_stock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  In Stock - Ships from USA
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Contact for Availability
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div className="mt-5">
              <div className="flex items-center gap-4">
                <div className="text-xl font-semibold">
                  {priceStr ? priceStr : <span className="text-neutral-500 text-base">Call for pricing</span>}
                </div>
                <BuyNowButton priceId={null} slug={product.slug} />
                <QuoteButton product={{ name: product.name, slug: product.slug, sku: product.sku }} />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                💼 <strong>Bulk orders or purchase order?</strong> Get volume pricing and NET-30
                terms with a custom quote.
              </p>
            </div>

            {/* Manual PDF */}
            {product.manual_pdf_url && (
              <div className="mt-4">
                <a
                  href={product.manual_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Product Manual (PDF)
                </a>
              </div>
            )}

            {/* Specifications Table */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <DynamicSpecTable specs={product.specs} />

              {/* Contextual Help Below Specs */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Need help understanding these specs?</span>{" "}
                  Our{" "}
                  <a
                    href="/battery-chargers#charger-selector"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Charger Selector Tool
                  </a>{" "}
                  and{" "}
                  <a
                    href="/battery-chargers#faq"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    FAQ section
                  </a>{" "}
                  can help you choose the right specifications for your forklift.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility List (Searchable) */}
        <CompatibilityList items={product.compatibility_list} />

        {/* Educational Resources Section */}
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
                  <svg
                    className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Interactive Selector
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Answer 3 questions and get personalized charger recommendations for your specific
                  needs
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
                  <svg
                    className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Expert Guides
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  15,000+ word comprehensive guides on voltage selection, installation, and
                  maintenance
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
                  <svg
                    className="w-6 h-6 text-green-600 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Charger FAQ
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get answers to common questions about amperage, voltage, charging times, and
                  compatibility
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Related Chargers */}
        <div className="mt-12">
          <RelatedChargers currentSlug={product.slug} />
        </div>
      </div>
    </main>
  );
}
