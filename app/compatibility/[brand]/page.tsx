import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  COMPATIBILITY_DATA, 
  getCompatibilityByBrand, 
  getAllBrands,
} from '@/lib/compatibility-data';
import { ShieldCheck, ArrowRight, ArrowLeft, Wrench, Calendar } from 'lucide-react';

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  const brands = getAllBrands();
  return brands.map(brand => ({ brand: brand.toLowerCase() }));
}

// =============================================================================
// Types & Metadata
// =============================================================================

interface PageProps {
  params: { brand: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const models = getCompatibilityByBrand(params.brand);
  
  if (models.length === 0) {
    return { title: 'Brand Not Found | Flat Earth Equipment' };
  }

  const brandDisplay = models[0].brand;

  return {
    title: `${brandDisplay} Charger Replacements | OEM Fit Battery Chargers`,
    description: `Find verified replacement chargers for ${brandDisplay} equipment. ${models.length} models supported including ${models.slice(0, 3).map(m => m.model).join(', ')}. Same-day shipping with 6-month warranty.`,
    keywords: [
      `${brandDisplay.toLowerCase()} charger`,
      `${brandDisplay.toLowerCase()} battery charger`,
      `${brandDisplay.toLowerCase()} charger replacement`,
      ...models.map(m => `${brandDisplay.toLowerCase()} ${m.model.toLowerCase()} charger`),
    ],
    alternates: {
      canonical: `https://www.flatearthequipment.com/compatibility/${params.brand}`,
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default function BrandCompatibilityPage({ params }: PageProps) {
  const models = getCompatibilityByBrand(params.brand);
  
  if (models.length === 0) {
    notFound();
  }

  const brandDisplay = models[0].brand;

  // Group models by charger product
  const modelsByProduct: Record<string, typeof models> = {};
  for (const model of models) {
    const productName = model.products[0].productName;
    if (!modelsByProduct[productName]) {
      modelsByProduct[productName] = [];
    }
    modelsByProduct[productName].push(model);
  }

  return (
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
            <Link href="/compatibility" className="hover:text-canyon-rust transition-colors">
              Compatibility Hub
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-900 font-medium">{brandDisplay}</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 lg:p-12 mb-10 text-white">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-full flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Verified OEM Fit
          </span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold rounded-full flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            2026 Fleet Compliant
          </span>
        </div>

        <h1 className="text-3xl lg:text-5xl font-bold mb-4">
          <span className="text-canyon-rust">{brandDisplay}</span> Charger Replacements
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Verified replacement chargers for {brandDisplay} equipment. All chargers are tested, 
          certified, and ship same-day with our 6-month warranty.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{models.length}</p>
              <p className="text-sm text-slate-400">Models Supported</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(modelsByProduct).length}</p>
              <p className="text-sm text-slate-400">Charger Options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models by Product */}
      <div className="space-y-10">
        {Object.entries(modelsByProduct).map(([productName, productModels]) => {
          const firstProduct = productModels[0].products[0];
          
          return (
            <section key={productName}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{productName}</h2>
                  <p className="text-slate-600">{firstProduct.partNumber}</p>
                </div>
                <Link
                  href={`/chargers/${firstProduct.productSlug}`}
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-canyon-rust hover:underline"
                >
                  View Charger Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productModels.map((model) => (
                  <Link
                    key={model.slug}
                    href={`/compatibility/${params.brand}/${model.slug}`}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-canyon-rust hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-600">
                          {brandDisplay.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-canyon-rust transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-canyon-rust transition-colors mb-1">
                      {model.model}
                    </h3>
                    {model.products[0].oemRef && (
                      <p className="text-sm text-slate-500">
                        OEM: <code className="font-mono bg-slate-100 px-1 rounded">{model.products[0].oemRef}</code>
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Other Brands */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Other Equipment Brands</h2>
        <div className="flex flex-wrap gap-3">
          {getAllBrands()
            .filter(b => b.toLowerCase() !== params.brand)
            .map(brand => (
              <Link
                key={brand}
                href={`/compatibility/${brand.toLowerCase()}`}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
              >
                {brand}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 bg-slate-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Don't See Your {brandDisplay} Model?
        </h2>
        <p className="text-slate-600 mb-6">
          We're continuously adding new models to our compatibility database. Contact us 
          and we'll verify fitment for your specific equipment.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 bg-canyon-rust text-white rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
          >
            Request Compatibility Check
          </Link>
          <Link
            href="/chargers"
            className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
          >
            Browse All Chargers
          </Link>
        </div>
      </section>
    </main>
  );
}

