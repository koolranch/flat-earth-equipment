import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  COMPATIBILITY_DATA, 
  getCompatibilityByBrand, 
  getAllBrands,
} from '@/lib/compatibility-data';
import { ShieldCheck, ArrowRight, ArrowLeft, Wrench, Calendar, Box, HardHat } from 'lucide-react';

// Create Supabase client for static generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================================================================
// Data Fetching
// =============================================================================

interface SupabaseModel {
  id: string;
  model_name: string;
  brand: string;
  slug: string;
  brand_slug: string;
  equipment_type: string;
  ita_class: string | null;
  voltage_options: number[] | null;
  power_type: string | null;
  display_name: string | null;
  meta_description: string | null;
}

async function getModelsByBrand(brandSlug: string): Promise<SupabaseModel[]> {
  const { data } = await supabase
    .from('machine_models')
    .select('*')
    .eq('brand_slug', brandSlug)
    .order('model_name');
  
  return data || [];
}

async function getAllSupabaseBrands(): Promise<string[]> {
  const { data } = await supabase
    .from('machine_models')
    .select('brand_slug')
    .order('brand_slug');
  
  if (!data) return [];
  return [...new Set(data.map(d => d.brand_slug))];
}

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  // Get brands from both static data and Supabase
  const staticBrands = getAllBrands().map(b => b.toLowerCase());
  const supabaseBrands = await getAllSupabaseBrands();
  
  const allBrands = [...new Set([...staticBrands, ...supabaseBrands])];
  return allBrands.map(brand => ({ brand }));
}

// =============================================================================
// Types & Metadata
// =============================================================================

interface PageProps {
  params: { brand: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Try static data first
  const staticModels = getCompatibilityByBrand(params.brand);
  
  if (staticModels.length > 0) {
    const brandDisplay = staticModels[0].brand;
    const modelList = staticModels.slice(0, 3).map(m => m.model).join(', ');
    const oemRefs = staticModels
      .filter(m => m.products[0]?.oemRef)
      .slice(0, 2)
      .map(m => m.products[0].oemRef)
      .join(', ');
    
    // Enhanced description with OEM part numbers
    const description = `Verified fitment for ${brandDisplay} equipment. Find ${oemRefs ? `${oemRefs} ` : ''}chargers, forks, and common wear parts. ${staticModels.length} models: ${modelList}. Ships same-day with 6-month warranty.`;
    
    // Ensure canonical URL has no trailing slash
    const canonicalUrl = `https://www.flatearthequipment.com/compatibility/${params.brand}`.replace(/\/+$/, '');
    
    return {
      title: `${brandDisplay} Charger Replacements | OEM Fit Battery Chargers`,
      description,
      keywords: [
        `${brandDisplay.toLowerCase()} charger`,
        `${brandDisplay.toLowerCase()} battery charger`,
        `${brandDisplay.toLowerCase()} charger replacement`,
        `${brandDisplay.toLowerCase()} oem parts`,
        ...staticModels.map(m => `${brandDisplay.toLowerCase()} ${m.model.toLowerCase()} charger`),
      ],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // Try Supabase
  const supabaseModels = await getModelsByBrand(params.brand);
  
  if (supabaseModels.length === 0) {
    return { title: 'Brand Not Found | Flat Earth Equipment' };
  }

  const brandDisplay = supabaseModels[0].brand;
  const modelNames = supabaseModels.slice(0, 3).map(m => m.model_name).join(', ');
  
  // Get voltage info for enhanced description
  const voltageInfo = supabaseModels
    .filter(m => m.voltage_options && m.voltage_options.length > 0)
    .slice(0, 1)
    .map(m => m.voltage_options?.join('V/') + 'V')
    .join('');
  
  // Enhanced description with model specifics
  const description = `Verified fitment for ${brandDisplay} equipment. Find ${voltageInfo ? `${voltageInfo} ` : ''}chargers, forks, and common wear parts. ${supabaseModels.length} models: ${modelNames}. OEM cross-reference included. Ships same-day.`;
  
  // Ensure canonical URL has no trailing slash
  const canonicalUrl = `https://www.flatearthequipment.com/compatibility/${params.brand}`.replace(/\/+$/, '');

  return {
    title: `${brandDisplay} Parts & Compatibility | OEM Service Parts`,
    description,
    keywords: [
      `${brandDisplay.toLowerCase()} parts`,
      `${brandDisplay.toLowerCase()} oem parts`,
      `${brandDisplay.toLowerCase()} service parts`,
      `${brandDisplay.toLowerCase()} charger`,
      ...supabaseModels.map(m => `${brandDisplay.toLowerCase()} ${m.model_name.toLowerCase()} parts`),
    ],
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// =============================================================================
// Equipment Type Helpers
// =============================================================================

function getEquipmentIcon(type: string) {
  switch (type) {
    case 'skid_steer':
    case 'compact_loader':
    case 'mini_excavator':
    case 'telehandler':
      return <HardHat className="w-5 h-5" />;
    case 'forklift':
    case 'pallet_jack':
      return <Box className="w-5 h-5" />;
    default:
      return <Wrench className="w-5 h-5" />;
  }
}

function getEquipmentLabel(type: string) {
  const labels: Record<string, string> = {
    forklift: 'Forklift',
    pallet_jack: 'Pallet Jack',
    scissor_lift: 'Scissor Lift',
    boom_lift: 'Boom Lift',
    skid_steer: 'Skid Steer',
    compact_loader: 'Compact Loader',
    mini_excavator: 'Mini Excavator',
    telehandler: 'Telehandler',
    utility_vehicle: 'Utility Vehicle',
    golf_cart: 'Golf Cart',
  };
  return labels[type] || 'Equipment';
}

// =============================================================================
// Page Component
// =============================================================================

export default async function BrandCompatibilityPage({ params }: PageProps) {
  // Try static data first
  const staticModels = getCompatibilityByBrand(params.brand);
  
  // Also get Supabase models
  const supabaseModels = await getModelsByBrand(params.brand);
  
  // If neither has data, 404
  if (staticModels.length === 0 && supabaseModels.length === 0) {
    notFound();
  }

  // Determine brand display name
  const brandDisplay = staticModels.length > 0 
    ? staticModels[0].brand 
    : supabaseModels[0].brand;

  // If we have static models, render the original charger-focused view
  if (staticModels.length > 0) {
    // Group models by charger product
    const modelsByProduct: Record<string, typeof staticModels> = {};
    for (const model of staticModels) {
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
                <p className="text-2xl font-bold">{staticModels.length}</p>
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

  // =========================================================================
  // Supabase-only brands (Raymond, Crown, Bobcat, Kubota, Toro, JCB, etc.)
  // =========================================================================
  
  // Group models by equipment type
  const modelsByType: Record<string, SupabaseModel[]> = {};
  for (const model of supabaseModels) {
    const type = model.equipment_type || 'other';
    if (!modelsByType[type]) {
      modelsByType[type] = [];
    }
    modelsByType[type].push(model);
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
            Verified OEM Parts
          </span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold rounded-full flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            2026 Fleet Compliant
          </span>
        </div>

        <h1 className="text-3xl lg:text-5xl font-bold mb-4">
          <span className="text-canyon-rust">{brandDisplay}</span> Compatibility Hub
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Find OEM parts, service components, and verified fitment data for {brandDisplay} equipment.
          Browse by model to see compatible chargers, filters, and maintenance parts.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{supabaseModels.length}</p>
              <p className="text-sm text-slate-400">Models Supported</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(modelsByType).length}</p>
              <p className="text-sm text-slate-400">Equipment Types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models by Equipment Type */}
      <div className="space-y-10">
        {Object.entries(modelsByType).map(([type, typeModels]) => (
          <section key={type}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                {getEquipmentIcon(type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{getEquipmentLabel(type)}s</h2>
                <p className="text-slate-600">{typeModels.length} model{typeModels.length !== 1 ? 's' : ''} supported</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {typeModels.map((model) => (
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
                    {model.display_name || model.model_name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {model.voltage_options && model.voltage_options.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        {model.voltage_options.join('V / ')}V
                      </span>
                    )}
                    {model.power_type && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                        {model.power_type}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-16 bg-slate-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Don't See Your {brandDisplay} Model?
        </h2>
        <p className="text-slate-600 mb-6">
          We're continuously adding new models to our compatibility database. Contact us 
          and we'll help you find the right parts for your equipment.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 bg-canyon-rust text-white rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
          >
            Request Compatibility Check
          </Link>
          <Link
            href="/parts"
            className="px-6 py-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust transition-colors"
          >
            Browse All Parts
          </Link>
        </div>
      </section>
    </main>
  );
}

