import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { CHARGER_MODULES } from '@/constants/chargerOptions';
import TechnicalSpecsTable from '@/components/seo/TechnicalSpecsTable';
import ProductSupportFAQ from '@/components/seo/ProductSupportFAQ';
import { 
  getStripeProduct, 
  generateMetaDescription, 
  generateProductSchema,
  parseCompatibleChargers,
} from '@/lib/stripe';
import QuoteButton from '@/components/QuoteButton';
import { ShieldCheck, Truck, Clock, Wrench, ArrowLeft } from 'lucide-react';

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;

// Map SKU slugs to Stripe product IDs (verified via chargerOptions.ts price IDs)
const SKU_TO_STRIPE_ID: Record<string, { productId: string; moduleIndex: number }> = {
  'enersys-6LA20671': { productId: 'prod_SJfLj8ykMeUVit', moduleIndex: 0 },
  'hawker-6LA20671': { productId: 'prod_SJfLX5eYSChvS0', moduleIndex: 1 },
};

export async function generateStaticParams() {
  return Object.keys(SKU_TO_STRIPE_ID).map(sku => ({ sku }));
}

// =============================================================================
// Metadata Generation
// =============================================================================

interface PageProps {
  params: { sku: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const skuMapping = SKU_TO_STRIPE_ID[params.sku];
  
  if (!skuMapping) {
    return { title: 'Product Not Found | Flat Earth Equipment' };
  }

  const chargerModule = CHARGER_MODULES[skuMapping.moduleIndex];
  const stripeProduct = await getStripeProduct(skuMapping.productId);

  // Use seo_pro_tip from Stripe metadata for description (snippet-optimized)
  const description = stripeProduct?.metadata?.seo_pro_tip 
    ? stripeProduct.metadata.seo_pro_tip.slice(0, 160)
    : `Buy remanufactured ${chargerModule.brand} ${chargerModule.partNumber} charger module. 6-month warranty, free shipping. Same-day dispatch available.`;

  return {
    title: `${chargerModule.brand} ${chargerModule.partNumber} | Forklift Charger Module | Flat Earth Equipment`,
    description,
    keywords: [
      `${chargerModule.brand.toLowerCase()} charger module`,
      `${chargerModule.partNumber} replacement`,
      `${chargerModule.partNumber} repair`,
      'forklift charger module',
      `${chargerModule.brand.toLowerCase()} ${chargerModule.partNumber}`,
      'charger module exchange',
    ],
    openGraph: {
      title: `${chargerModule.brand} ${chargerModule.partNumber} Charger Module`,
      description,
      images: chargerModule.imgExchange ? [{ url: chargerModule.imgExchange }] : undefined,
      type: 'website',
    },
    alternates: {
      canonical: `https://www.flatearthequipment.com/charger-modules/${params.sku}`,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function ChargerModuleDetailPage({ params }: PageProps) {
  const skuMapping = SKU_TO_STRIPE_ID[params.sku];
  
  if (!skuMapping) {
    notFound();
  }

  const chargerModule = CHARGER_MODULES[skuMapping.moduleIndex];
  const stripeProduct = await getStripeProduct(skuMapping.productId);
  const metadata = stripeProduct?.metadata || {};

  // Parse compatible chargers from metadata
  const compatibleChargers = parseCompatibleChargers(metadata.compatible_chargers);

  // Generate Product schema
  const productSchema = stripeProduct 
    ? generateProductSchema(stripeProduct, `https://www.flatearthequipment.com/charger-modules/${params.sku}`)
    : null;

  return (
    <>
      {/* JSON-LD Product Schema */}
      {productSchema && (
        <Script
          id="product-schema"
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
              src={chargerModule.imgExchange}
              alt={`${chargerModule.brand} ${chargerModule.partNumber} Charger Module`}
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
                {chargerModule.brand}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {chargerModule.partNumber} Charger Module
              </h1>
              <p className="text-lg text-slate-600">
                Remanufactured {chargerModule.brand} power module with 6-month warranty
              </p>
            </div>

            {/* Pricing Options */}
            <div className="space-y-4">
              {chargerModule.offers.map((offer, index) => (
                <div 
                  key={index}
                  className={`
                    border-2 rounded-xl p-6 transition-all
                    ${offer.label === 'Reman Exchange' 
                      ? 'border-canyon-rust bg-canyon-rust/5' 
                      : 'border-slate-200 hover:border-slate-300'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-slate-900">{offer.label}</span>
                    <span className="text-2xl font-bold text-canyon-rust">
                      ${(offer.price / 100).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{offer.desc}</p>
                  {offer.coreInfo && (
                    <p className="text-sm text-slate-500 mb-3">{offer.coreInfo}</p>
                  )}
                  <QuoteButton 
                    sku={offer.sku}
                    productName={`${chargerModule.brand} ${chargerModule.partNumber} (${offer.label})`}
                  />
                </div>
              ))}
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
            title={`${chargerModule.brand} ${chargerModule.partNumber} Specifications`}
            metadata={metadata}
            proTip={metadata.seo_pro_tip}
            footnote="Specifications based on standard OEM configuration. Consult documentation for your specific model."
          />
        </section>

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
            productName={`${chargerModule.brand} ${chargerModule.partNumber}`}
            additionalFaqs={[
              {
                question: `How long is the warranty on a remanufactured ${chargerModule.brand} ${chargerModule.partNumber}?`,
                answer: `All remanufactured ${chargerModule.brand} charger modules come with a 6-month warranty covering defects in workmanship. If you experience any issues within the warranty period, we offer free repair or replacement.`,
              },
              {
                question: `What's the difference between "Reman Exchange" and "Repair & Return"?`,
                answer: 'Reman Exchange ships you a pre-tested replacement module same-day; you then return your failed unit (core deposit refunded upon receipt). Repair & Return means you ship us your module, we refurbish it, and return the same unit to you within 3-5 business days.',
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

