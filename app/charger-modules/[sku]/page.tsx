import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { CHARGER_MODULES } from '@/constants/chargerOptions';
import TechnicalSpecsTable from '@/components/seo/TechnicalSpecsTable';
import ProductSupportFAQ from '@/components/seo/ProductSupportFAQ';
import CompatibilityTable from '@/components/seo/CompatibilityTable';
import { 
  getStripeProduct, 
  generateMetaDescription, 
  generateProductSchema,
  parseCompatibleChargers,
} from '@/lib/stripe';
import QuoteButton from '@/components/QuoteButton';
import FitmentValidator from '@/components/FitmentValidator';
import { ShieldCheck, Truck, Clock, Wrench, ArrowLeft } from 'lucide-react';

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get product data from Supabase database
async function getProductBySlug(slug: string) {
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
}

export async function generateStaticParams() {
  try {
    // Fetch GREEN series charger parts from the database (Phase 4 focus)
    const { data: parts, error } = await supabase
      .from('parts')
      .select('slug')
      .eq('category', 'Battery Chargers')
      .ilike('slug', 'green%')
      .not('slug', 'is', null);
    
    if (error) {
      console.error('Error fetching GREEN series parts:', error);
      // Fallback to old hardcoded values
      return [
        { sku: 'enersys-6LA20671' },
        { sku: 'hawker-6LA20671' }
      ];
    }
    
    console.log(`Generating static paths for ${parts.length} GREEN series chargers`);
    const greenPaths = parts.map(part => ({ sku: part.slug }));
    
    // Also include the original hardcoded chargers
    const allPaths = [
      ...greenPaths,
      { sku: 'enersys-6LA20671' },
      { sku: 'hawker-6LA20671' }
    ];
    
    return allPaths;
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [
      { sku: 'enersys-6LA20671' },
      { sku: 'hawker-6LA20671' }
    ];
  }
}

// =============================================================================
// Metadata Generation
// =============================================================================

interface PageProps {
  params: { sku: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.sku);
  
  if (!product) {
    return { title: 'Product Not Found | Flat Earth Equipment' };
  }

  const stripeProduct = product.stripe_product_id ? await getStripeProduct(product.stripe_product_id) : null;

  // Use description from database or generate from product data
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
      canonical: `https://www.flatearthequipment.com/charger-modules/${params.sku}`,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function ChargerModuleDetailPage({ params }: PageProps) {
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

