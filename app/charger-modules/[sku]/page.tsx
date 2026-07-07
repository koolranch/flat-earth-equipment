import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CHARGER_MODULES, ChargerModule } from '@/constants/chargerOptions';
import OptionSelectorCard from '@/components/OptionSelectorCard';
import TechnicalSpecsTable, { CHARGER_MODULE_SPECS } from '@/components/seo/TechnicalSpecsTable';
import ProductSupportFAQ from '@/components/seo/ProductSupportFAQ';
import CompatibilityTable from '@/components/seo/CompatibilityTable';
import {
  getStripeProduct,
  generateProductSchema,
  parseCompatibleChargers,
} from '@/lib/stripe';
import QuoteButton from '@/components/QuoteButton';
import FitmentValidator from '@/components/FitmentValidator';
import { getUserLocale } from '@/lib/getUserLocale';
import { ShieldCheck, Truck, Clock, Wrench, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;

const BASE = 'https://www.flatearthequipment.com';

// Create admin client for static generation
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing Supabase admin credentials');
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Get product data from Supabase database (legacy GREEN-series path)
async function getProductBySlug(slug: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to create admin client:', err);
    return null;
  }
}

// Dedicated part-number charger module pages driven by constants
function getChargerModuleBySlug(sku: string): ChargerModule | undefined {
  return CHARGER_MODULES.find((m) => m.slug === sku.toLowerCase());
}

export async function generateStaticParams() {
  const modulePaths = CHARGER_MODULES.map((m) => ({ sku: m.slug }));

  try {
    const supabase = createAdminClient();

    // Fetch GREEN series charger parts from the database (Phase 4 focus)
    const { data: parts, error } = await supabase
      .from('parts')
      .select('slug')
      .eq('category', 'Battery Chargers')
      .ilike('slug', 'green%')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching GREEN series parts:', error);
      return modulePaths;
    }

    const greenPaths = parts.map(part => ({ sku: part.slug }));
    return [...modulePaths, ...greenPaths];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return modulePaths;
  }
}

// =============================================================================
// Metadata Generation
// =============================================================================

interface PageProps {
  params: { sku: string };
}

function moduleMetaTitle(m: ChargerModule): string {
  if (m.brand === 'ACT') {
    return `ACT ${m.partNumber} Charger Module | ${m.crossRefPn} | Reman & Repair`;
  }
  return `${m.brand} ${m.partNumber} Charger Module | Reman & Repair`;
}

function moduleMetaDescription(m: ChargerModule): string {
  const reman = m.offers.find((o) => o.label === 'Reman Exchange');
  const repair = m.offers.find((o) => o.label === 'Repair & Return');
  const crossRef = m.crossRefPn ? ` Cross-references Hyster/Yale Premier ${m.crossRefPn}.` : '';
  return (
    `In-stock remanufactured ${m.brand} ${m.partNumber} forklift charger module.${crossRef} ` +
    `Reman exchange $${((reman?.price ?? 0) / 100).toFixed(0)} or send-in repair $${((repair?.price ?? 0) / 100).toFixed(0)}. ` +
    `6-month warranty, free shipping, ships same day.`
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const chargerModule = getChargerModuleBySlug(params.sku);

  if (chargerModule) {
    const url = `${BASE}/charger-modules/${chargerModule.slug}`;
    const description = moduleMetaDescription(chargerModule);
    return {
      title: moduleMetaTitle(chargerModule),
      description,
      keywords: [
        `${chargerModule.brand.toLowerCase()} ${chargerModule.partNumber.toLowerCase()}`,
        `${chargerModule.partNumber.toLowerCase()} charger module`,
        ...(chargerModule.crossRefPn ? [chargerModule.crossRefPn.toLowerCase(), `${chargerModule.crossRefPn.toLowerCase()} charger module`] : []),
        'forklift charger module',
        'forklift charger module repair',
        'reman charger module exchange',
      ],
      alternates: {
        canonical: url,
        languages: { 'en-US': url, 'x-default': url },
      },
      openGraph: {
        title: moduleMetaTitle(chargerModule),
        description,
        type: 'website',
        url,
        images: [{ url: chargerModule.imgExchange, width: 1200, height: 1200, alt: chargerModule.title }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: moduleMetaTitle(chargerModule),
        description,
        images: [chargerModule.imgExchange],
      },
    };
  }

  const product = await getProductBySlug(params.sku);

  if (!product) {
    return { title: 'Product Not Found | Flat Earth Equipment' };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} battery charger. Industrial grade, OSHA-compliant. Free shipping, 6-month warranty.`;

  return {
    title: `${product.name} | Industrial Battery Charger | Flat Earth Equipment`,
    description,
    keywords: [
      `${product.brand?.toLowerCase() || 'industrial'} battery charger`,
      `${product.sku} replacement`,
      `${product.name.toLowerCase()}`,
      'industrial battery charger',
      'forklift charger',
      'FSIP charger',
      'GREEN series charger',
    ],
    openGraph: {
      title: `${product.name} - Industrial Battery Charger`,
      description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
      type: 'website',
    },
    alternates: {
      canonical: `${BASE}/charger-modules/${params.sku}`,
    },
  };
}

// =============================================================================
// Dedicated part-number page (Enersys / Hawker / ACT Quantum modules)
// =============================================================================

function buildModuleJsonLd(m: ChargerModule) {
  const url = `${BASE}/charger-modules/${m.slug}`;
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: m.title,
      sku: m.partNumber,
      mpn: m.crossRefPn ?? m.partNumber,
      brand: { '@type': 'Brand', name: m.brand },
      image: m.imgExchange,
      description: moduleMetaDescription(m),
      url,
      offers: m.offers.map((offer) => ({
        '@type': 'Offer',
        name: `${m.title} (${offer.label})`,
        url,
        price: (offer.price / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/RefurbishedCondition',
        priceValidUntil,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Charger Modules', item: `${BASE}/charger-modules` },
        { '@type': 'ListItem', position: 2, name: `${m.brand} ${m.partNumber}`, item: url },
      ],
    },
  ];
}

function ChargerModulePage({ module }: { module: ChargerModule }) {
  const locale = getUserLocale();
  const siblings = CHARGER_MODULES.filter((m) => m.slug !== module.slug);
  const crossRefLine = module.crossRefPn
    ? ` This module cross-references Hyster/Yale Premier part number ${module.crossRefPn}.`
    : '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildModuleJsonLd(module)) }}
      />

      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 sm:pb-12 space-y-12">
        {/* Breadcrumb */}
        <nav>
          <Link
            href="/charger-modules"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-canyon-rust transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Charger Modules
          </Link>
        </nav>

        <header className="max-w-3xl space-y-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900">
            {module.brand} {module.partNumber} Forklift Charger Module
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Remanufactured {module.brand} {module.partNumber} charger module, bench-tested to exceed
            OEM specifications.{crossRefLine} Choose an instant reman exchange that ships today, or
            send your unit in for repair and return. Both options include a 6-month warranty and
            free nationwide shipping.
          </p>
        </header>

        {/* Buy card */}
        <section className="max-w-xl">
          <OptionSelectorCard module={module} locale={locale} showDetailsLink={false} />
        </section>

        {/* Trust badges */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span>6-Month Warranty</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Same-Day Dispatch</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Wrench className="w-5 h-5 text-purple-600" />
            <span>Full Load Tested</span>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
          <TechnicalSpecsTable
            title={`${module.brand} ${module.partNumber} Charger Module Specifications`}
            specs={CHARGER_MODULE_SPECS}
            footnote="Specifications based on standard OEM configuration. Contact us to verify compatibility with your specific charger."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-200 space-y-4">
            <details className="group pt-4 first:pt-0">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">How does the core refund work on the reman exchange?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                We pre-charge a refundable $350 core deposit at checkout. Ship your old {module.partNumber} module
                back within 30 days using the prepaid label included with your replacement, and we refund the
                full $350 within 48 hours of receiving it.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What if I don&apos;t know my firmware version?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Leave the firmware field blank. Our team will email you within 2 hours to confirm compatibility
                before anything ships. We stock multiple firmware versions and can match your specific charger.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What does the remanufacturing process include?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Complete disassembly, component-level inspection, replacement of worn parts, firmware updates,
                and bench testing at multiple voltage levels and load conditions before shipping.
              </p>
            </details>

            <details className="group pt-4">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none flex items-center justify-between">
                <span className="text-base">What&apos;s the warranty and return policy?</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">▼</span>
              </summary>
              <p className="text-base text-slate-700 mt-3 leading-relaxed">
                Every module carries a 6-month warranty covering defects and performance issues, plus a 30-day
                satisfaction guarantee with a full refund (including the core deposit if applicable).
              </p>
            </details>
          </div>
        </section>

        {/* Sibling modules */}
        <section className="max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Other Charger Modules</h2>
          <div className="flex flex-wrap gap-3">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/charger-modules/${s.slug}`}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
              >
                {s.brand} {s.partNumber}
                {s.crossRefPn ? ` (${s.crossRefPn})` : ''}
              </Link>
            ))}
            <Link
              href="/charger-modules"
              className="px-4 py-2 bg-canyon-rust text-white rounded-lg text-sm font-medium hover:bg-canyon-rust/90 transition-colors"
            >
              All Charger Modules →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default async function ChargerModuleDetailPage({ params }: PageProps) {
  const chargerModule = getChargerModuleBySlug(params.sku);

  if (chargerModule) {
    // Legacy mixed-case URLs (e.g. /charger-modules/enersys-6LA20671) render the
    // same page; the canonical tag points at the lowercase slug so search
    // engines consolidate. permanentRedirect() is unusable here: force-static
    // caches the redirect without a Location header.
    return <ChargerModulePage module={chargerModule} />;
  }

  const product = await getProductBySlug(params.sku);

  if (!product) {
    notFound();
  }

  const stripeProduct = product.stripe_product_id ? await getStripeProduct(product.stripe_product_id) : null;
  const metadata = stripeProduct?.metadata || {};

  // Parse compatible chargers from metadata
  const compatibleChargers = parseCompatibleChargers(metadata.compatible_chargers);

  // Generate Product schema
  const productSchema = stripeProduct 
    ? generateProductSchema(stripeProduct, `${BASE}/charger-modules/${params.sku}`)
    : null;

  return (
    <>
      {/* JSON-LD Product Schema */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 sm:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/charger-modules"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-canyon-rust transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Charger Modules
          </Link>
        </nav>

        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="bg-white rounded-2xl shadow-lg border p-8 flex items-center justify-center">
            <Image
              src={product.image_url || '/images/chargers/default-charger.jpg'}
              alt={`${product.name} Industrial Battery Charger`}
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                {product.brand || 'FSIP'}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-slate-600">
                {product.description || `Industrial battery charger - ${product.name}`}
              </p>
            </div>

            {/* Quote Button */}
            <div className="space-y-4">
              <div className="border-2 border-canyon-rust bg-canyon-rust/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-slate-900">Request Quote</span>
                  <span className="text-lg font-bold text-canyon-rust">
                    Contact for Pricing
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Get personalized pricing for {product.name}. Free shipping and professional support included.
                </p>
                <QuoteButton 
                  product={{
                    name: product.name,
                    slug: params.sku,
                    sku: product.sku || params.sku,
                  }}
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>6-Month Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Same-Day Dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Wrench className="w-5 h-5 text-purple-600" />
                <span>Full Load Tested</span>
              </div>
            </div>

            {/* Fitment Validator */}
            {product.stripe_product_id && (
              <div className="pt-4">
                <FitmentValidator
                  productId={product.stripe_product_id}
                  productName={product.name}
                  compatibilityList={metadata.spec_compatibility_list}
                />
              </div>
            )}
          </div>
        </div>

        {/* Information Gain Section */}
        {metadata.seo_information_gain && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-12">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Why Buy From Flat Earth Equipment?</h2>
            <p className="text-blue-800">{metadata.seo_information_gain}</p>
          </div>
        )}

        {/* Technical Specifications (Dynamic from Stripe metadata) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
          <TechnicalSpecsTable
            title={`${product.name} Specifications`}
            metadata={metadata}
            proTip={metadata.seo_pro_tip}
            footnote="Specifications based on standard OEM configuration. Consult documentation for your specific model."
          />
        </section>

        {/* OEM Cross-Reference / Verified Fitment Table */}
        {metadata.spec_compatibility && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">OEM Cross-Reference</h2>
            <CompatibilityTable
              compatibility={metadata.spec_compatibility}
              productName={product.name}
              verifiedDate="Jan 2026"
            />
          </section>
        )}

        {/* Compatible Chargers */}
        {compatibleChargers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Compatible Chargers</h2>
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <div className="flex flex-wrap gap-2">
                {compatibleChargers.map((charger, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                  >
                    {charger}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Not sure if this module fits your charger? Contact us for compatibility verification.
              </p>
            </div>
          </section>
        )}

        {/* Fault Codes FAQ (with JSON-LD) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Troubleshooting Guide</h2>
          <ProductSupportFAQ
            faultCodes={metadata.fault_codes}
            productName={product.name}
            additionalFaqs={[
              {
                question: `How long is the warranty on ${product.name}?`,
                answer: `All ${product.brand || 'our'} industrial battery chargers come with comprehensive warranty coverage. Contact us for specific warranty terms and coverage details.`,
              },
              {
                question: `Is ${product.name} OSHA compliant?`,
                answer: `Yes, all our industrial battery chargers meet or exceed OSHA safety standards. They include proper safety features and are designed for industrial applications.`,
              },
            ]}
            includeSchema={true}
          />
        </section>

        {/* Cross-sell */}
        <section className="bg-slate-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Other Parts?</h2>
          <p className="text-slate-600 mb-6">
            We carry a full range of forklift parts including forks, chargers, and safety equipment.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/forks"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
            >
              Forklift Forks
            </Link>
            <Link
              href="/safety"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
            >
              OSHA Training
            </Link>
            <Link
              href="/charger-modules"
              className="px-6 py-3 bg-canyon-rust text-white rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
            >
              All Charger Modules
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
