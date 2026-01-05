import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
  COMPATIBILITY_DATA, 
  getCompatibilityBySlug,
  type CompatibilityEntry,
} from '@/lib/compatibility-data';
import { getStripeProduct, ProductWithMetadata } from '@/lib/stripe';
import TechnicalSpecsTable from '@/components/seo/TechnicalSpecsTable';
import ProductSupportFAQ from '@/components/seo/ProductSupportFAQ';
import CompatibilityTable from '@/components/seo/CompatibilityTable';
import QuoteButton from '@/components/QuoteButton';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CheckCircle, 
  Wrench,
  FileText,
  Calendar,
} from 'lucide-react';

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;

// Generate static params for all known brand/model combinations
export async function generateStaticParams() {
  return COMPATIBILITY_DATA.map(entry => ({
    brand: entry.brand.toLowerCase(),
    model: entry.slug,
  }));
}

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  params: { brand: string; model: string };
}

// =============================================================================
// Metadata Generation
// =============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const compatibility = getCompatibilityBySlug(params.brand, params.model);
  
  if (!compatibility) {
    return { title: 'Compatibility Not Found | Flat Earth Equipment' };
  }

  const product = compatibility.products[0];
  const brandDisplay = compatibility.brand;
  const modelDisplay = compatibility.model;
  const oemRef = product.oemRef ? ` (OEM: ${product.oemRef})` : '';

  return {
    title: `Replacement Charger for ${brandDisplay} ${modelDisplay} | Verified OEM Fit`,
    description: `Verified replacement charger for ${brandDisplay} ${modelDisplay}${oemRef}. Direct fit for ${product.productName}. Ships same-day with 6-month warranty. 2026 Fleet Compliant.`,
    keywords: [
      `${brandDisplay.toLowerCase()} ${modelDisplay.toLowerCase()} charger`,
      `${brandDisplay.toLowerCase()} ${modelDisplay.toLowerCase()} battery charger`,
      `${modelDisplay.toLowerCase()} charger replacement`,
      `${product.partNumber} replacement`,
      product.oemRef ? `${brandDisplay.toLowerCase()} ${product.oemRef}` : '',
      'forklift charger replacement',
      'scissor lift charger',
      'aerial lift charger',
    ].filter(Boolean),
    openGraph: {
      title: `${brandDisplay} ${modelDisplay} Charger Replacement`,
      description: `Verified OEM fit replacement charger for ${brandDisplay} ${modelDisplay}. Same-day shipping.`,
      type: 'website',
    },
    alternates: {
      canonical: `https://www.flatearthequipment.com/compatibility/${params.brand}/${params.model}`,
    },
  };
}

// =============================================================================
// Schema.org Product Markup Generator
// =============================================================================

function generateCompatibilitySchema(
  compatibility: CompatibilityEntry,
  stripeProduct: ProductWithMetadata | null,
  url: string
): object {
  const product = compatibility.products[0];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.productName} - ${compatibility.brand} ${compatibility.model} Replacement`,
    description: `Verified replacement charger for ${compatibility.brand} ${compatibility.model}. ${product.oemRef ? `Replaces OEM part ${product.oemRef}.` : ''}`,
    brand: {
      '@type': 'Brand',
      name: product.productName.includes('Delta-Q') ? 'Delta-Q' : 
            product.productName.includes('SPE') ? 'SPE' : 'Flat Earth Equipment',
    },
    sku: product.partNumber,
    // Link this charger to the specific forklift model it fits
    isSimilarTo: {
      '@type': 'Product',
      name: `${compatibility.brand} ${compatibility.model}`,
      brand: {
        '@type': 'Brand',
        name: compatibility.brand,
      },
      model: compatibility.model,
    },
    // Additional property linking via model
    model: {
      '@type': 'ProductModel',
      name: product.partNumber,
      isVariantOf: {
        '@type': 'ProductModel',
        name: `${compatibility.brand} ${compatibility.model} Compatible Chargers`,
      },
    },
    offers: stripeProduct?.defaultPrice ? {
      '@type': 'Offer',
      price: (stripeProduct.defaultPrice.unitAmount! / 100).toFixed(2),
      priceCurrency: stripeProduct.defaultPrice.currency.toUpperCase(),
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Flat Earth Equipment',
      },
    } : undefined,
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function CompatibilityPage({ params }: PageProps) {
  // Look up compatibility entry
  const compatibility = getCompatibilityBySlug(params.brand, params.model);
  
  if (!compatibility) {
    notFound();
  }

  const product = compatibility.products[0];
  
  // Fetch Stripe product data for specs and pricing
  const stripeProduct = await getStripeProduct(product.stripeProductId);
  const metadata = stripeProduct?.metadata || {};

  // Generate Schema.org markup
  const pageUrl = `https://www.flatearthequipment.com/compatibility/${params.brand}/${params.model}`;
  const productSchema = generateCompatibilitySchema(compatibility, stripeProduct, pageUrl);

  // Find related models from same brand
  const relatedModels = COMPATIBILITY_DATA.filter(
    entry => entry.brand === compatibility.brand && entry.slug !== compatibility.slug
  ).slice(0, 4);

  // Find other brands with same product
  const sameBrandCharger = COMPATIBILITY_DATA.filter(
    entry => 
      entry.products[0].stripeProductId === product.stripeProductId && 
      entry.brand !== compatibility.brand
  ).slice(0, 4);

  return (
    <>
      {/* JSON-LD Product Schema */}
      <Script
        id="compatibility-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 sm:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-canyon-rust transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/chargers" className="hover:text-canyon-rust transition-colors">
                Chargers
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link 
                href={`/compatibility/${params.brand}`} 
                className="hover:text-canyon-rust transition-colors capitalize"
              >
                {compatibility.brand}
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-medium">{compatibility.model}</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 lg:p-12 mb-10 text-white">
          <div className="max-w-4xl">
            {/* Verification Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Verified OEM Fit
              </span>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold rounded-full flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                2026 Fleet Compliant
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Replacement Charger for{' '}
              <span className="text-canyon-rust">{compatibility.brand} {compatibility.model}</span>
            </h1>

            <p className="text-lg text-slate-300 mb-6">
              The <strong>{product.productName}</strong> ({product.partNumber}) is a verified direct-fit 
              replacement charger for the {compatibility.brand} {compatibility.model}
              {product.oemRef && (
                <>, replacing OEM part number <code className="px-2 py-0.5 bg-white/10 rounded font-mono">{product.oemRef}</code></>
              )}.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Warranty</p>
                  <p className="font-semibold">6 Months</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Shipping</p>
                  <p className="font-semibold">Same-Day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Installation</p>
                  <p className="font-semibold">Plug & Play</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Condition</p>
                  <p className="font-semibold">Tested & Certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Product Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-24">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                  {product.productName.includes('Delta-Q') ? 'Delta-Q' : 
                   product.productName.includes('SPE') ? 'SPE' : 'Charger'}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{product.productName}</h2>
                <p className="text-sm text-slate-600">{product.partNumber}</p>
              </div>

              {/* Price */}
              {stripeProduct?.defaultPrice?.unitAmount && (
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-1">Starting at</p>
                  <p className="text-3xl font-bold text-canyon-rust">
                    ${(stripeProduct.defaultPrice.unitAmount / 100).toLocaleString()}
                  </p>
                </div>
              )}

              {/* OEM Reference */}
              {product.oemRef && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Replaces {compatibility.brand} OEM
                  </p>
                  <code className="text-lg font-mono font-bold text-slate-900">
                    {product.oemRef}
                  </code>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                <QuoteButton 
                  product={{
                    name: `${product.productName} for ${compatibility.brand} ${compatibility.model}`,
                    slug: product.productSlug,
                    sku: product.partNumber,
                  }}
                />
                <Link
                  href={`/chargers/${product.productSlug}`}
                  className="block w-full text-center px-4 py-3 border-2 border-slate-200 text-slate-700 font-medium rounded-lg hover:border-canyon-rust hover:text-canyon-rust transition-colors"
                >
                  View Full Product Details
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Verified fit for {compatibility.model}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Ships within 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Installation guide included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Specifications & FAQ */}
          <div className="lg:col-span-2 space-y-8">
            {/* Information Gain */}
            {metadata.seo_information_gain && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-2">
                  Why This Charger for Your {compatibility.brand} {compatibility.model}?
                </h2>
                <p className="text-blue-800">{metadata.seo_information_gain}</p>
              </div>
            )}

            {/* Technical Specifications */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
              <TechnicalSpecsTable
                title={`${product.productName} Specifications`}
                metadata={metadata}
                proTip={metadata.seo_pro_tip}
                footnote="Specifications verified for fleet compliance. Contact us for custom configurations."
              />
            </section>

            {/* OEM Cross-Reference */}
            {metadata.spec_compatibility && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">OEM Cross-Reference</h2>
                <CompatibilityTable
                  compatibility={metadata.spec_compatibility}
                  productName={product.productName}
                  verifiedDate="Jan 2026"
                />
              </section>
            )}

            {/* Troubleshooting Guide */}
            {metadata.fault_codes && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {compatibility.brand} {compatibility.model} Charger Troubleshooting
                </h2>
                <ProductSupportFAQ
                  faultCodes={metadata.fault_codes}
                  productName={`${compatibility.brand} ${compatibility.model} charger`}
                  includeSchema={true}
                  manualUrl={metadata.manual_url}
                />
              </section>
            )}
          </div>
        </div>

        {/* Related Equipment */}
        {relatedModels.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Other {compatibility.brand} Models We Support
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedModels.map((related) => (
                <Link
                  key={related.slug}
                  href={`/compatibility/${related.brand.toLowerCase()}/${related.slug}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-canyon-rust hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-canyon-rust transition-colors">
                        {related.model}
                      </p>
                      <p className="text-sm text-slate-600">
                        {related.products[0].productName}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-canyon-rust transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Same Charger, Different Brands */}
        {sameBrandCharger.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              This Charger Also Fits
            </h2>
            <div className="bg-slate-50 rounded-xl p-6">
              <p className="text-slate-600 mb-4">
                The {product.productName} is also a verified replacement for these models:
              </p>
              <div className="flex flex-wrap gap-3">
                {sameBrandCharger.map((related) => (
                  <Link
                    key={`${related.brand}-${related.slug}`}
                    href={`/compatibility/${related.brand.toLowerCase()}/${related.slug}`}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
                  >
                    {related.brand} {related.model}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Repair Components */}
        {compatibility.repairComponents && compatibility.repairComponents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Related Repair Components
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Already have a charger?</p>
                  <p className="text-sm text-amber-800">
                    If your existing charger cabinet is working but a power module has failed, 
                    these repair components may be what you need:
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {compatibility.repairComponents.map((component) => (
                  <div
                    key={component.stripeProductId}
                    className="bg-white border border-amber-200 rounded-lg p-4 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{component.productName}</p>
                        <code className="text-sm font-mono text-slate-600">{component.partNumber}</code>
                        {component.description && (
                          <p className="text-sm text-slate-600 mt-2">{component.description}</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/chargers/${component.productSlug}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
                    >
                      View Repair Component
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cross-sell */}
        <section className="bg-slate-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Other Parts?</h2>
          <p className="text-slate-600 mb-6">
            We carry a full range of parts for {compatibility.brand} equipment including chargers, batteries, and accessories.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/chargers"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
            >
              All Battery Chargers
            </Link>
            <Link
              href="/safety"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
            >
              Operator Training
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-canyon-rust text-white rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
            >
              Contact for Custom Parts
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

