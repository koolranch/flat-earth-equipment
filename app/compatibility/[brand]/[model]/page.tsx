import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { supabaseServer } from '@/lib/supabase/server';
import { 
  COMPATIBILITY_DATA, 
  getCompatibilityBySlug,
  type CompatibilityEntry,
} from '@/lib/compatibility-data';
import { getStripeProduct, ProductWithMetadata } from '@/lib/stripe';
import TechnicalSpecsTable, { FORK_SPECS } from '@/components/seo/TechnicalSpecsTable';
import ProductSupportFAQ from '@/components/seo/ProductSupportFAQ';
import CompatibilityTable from '@/components/seo/CompatibilityTable';
import QuoteButton from '@/components/QuoteButton';
import VoltageConfirmationWrapper from '@/components/VoltageConfirmationWrapper';
import OEMPartsSection from '@/components/OEMPartsSection';
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
  Zap,
  Box,
  Grid3X3,
  Cog,
  Battery,
  AlertTriangle,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface MachineModel {
  id: string;
  model_name: string;
  brand: string;
  slug: string;
  brand_slug: string;
  ita_class: string | null;
  voltage: number | null;
  voltage_options: number[] | null;
  requires_voltage_confirmation: boolean;
  battery_connector: string | null;
  default_fork_class: string | null;
  standard_fork_class: string | null;
  primary_charger_sku: string | null;
  oem_part_numbers: string[] | null;
  equipment_type: string;
  power_type: string | null;
  capacity_lbs: number | null;
  recommended_charger_id: string | null;
  recommended_charger_slug: string | null;
  repair_module_id: string | null;
  repair_module_slug: string | null;
  oem_part_ref: string | null;
  display_name: string | null;
  meta_description: string | null;
  verified_date: string;
}

interface PageProps {
  params: { brand: string; model: string };
}

// =============================================================================
// Static Generation
// =============================================================================

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

// Generate static params from both static data and Supabase
export async function generateStaticParams() {
  // Start with static compatibility data
  const staticParams = COMPATIBILITY_DATA.map(entry => ({
    brand: entry.brand.toLowerCase(),
    model: entry.slug,
  }));

  // Also fetch from Supabase for additional models
  try {
    const supabase = supabaseServer();
    const { data: models } = await supabase
      .from('machine_models')
      .select('brand_slug, slug');
    
    if (models) {
      const dbParams = models.map(m => ({
        brand: m.brand_slug,
        model: m.slug,
      }));
      
      // Combine and deduplicate
      const combined = [...staticParams];
      for (const param of dbParams) {
        if (!combined.some(p => p.brand === param.brand && p.model === param.model)) {
          combined.push(param);
        }
      }
      return combined;
    }
  } catch (error) {
    console.error('Error fetching machine_models:', error);
  }

  return staticParams;
}

// =============================================================================
// Data Fetching
// =============================================================================

async function getMachineModel(brandSlug: string, modelSlug: string): Promise<MachineModel | null> {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('machine_models')
      .select('*')
      .eq('brand_slug', brandSlug)
      .eq('slug', modelSlug)
      .single();
    
    if (error || !data) return null;
    return data as MachineModel;
  } catch {
    return null;
  }
}

// Fetch OEM parts for the model (quote_only items)
interface OEMPart {
  id: string;
  name: string;
  sku: string;
  oem_reference: string | null;
  brand: string;
  category: string;
  description: string;
  sales_type: 'direct' | 'quote_only';
  is_in_stock: boolean;
  price_cents: number | null;
}

async function getOEMPartsForModel(brandSlug: string, modelSlug: string): Promise<OEMPart[]> {
  try {
    const supabase = supabaseServer();
    const modelKey = `${brandSlug}-${modelSlug}`.toLowerCase();
    
    const { data, error } = await supabase
      .from('parts')
      .select('id, name, sku, oem_reference, brand, category, description, sales_type, is_in_stock, price_cents')
      .contains('compatible_models', [modelKey])
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching OEM parts:', error);
      return [];
    }
    
    return (data || []) as OEMPart[];
  } catch {
    return [];
  }
}

// =============================================================================
// Metadata Generation
// =============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Try Supabase first
  const machineModel = await getMachineModel(params.brand, params.model);
  
  // Fall back to static data
  const compatibility = getCompatibilityBySlug(params.brand, params.model);
  
  if (!machineModel && !compatibility) {
    return { title: 'Compatibility Not Found | Flat Earth Equipment' };
  }

  const brandDisplay = machineModel?.brand || compatibility?.brand || params.brand;
  const modelDisplay = machineModel?.model_name || compatibility?.model || params.model;
  const product = compatibility?.products[0];
  const oemRef = machineModel?.oem_part_ref || product?.oemRef;
  const itaClass = machineModel?.ita_class;
  const voltage = machineModel?.voltage;

  const title = `${brandDisplay} ${modelDisplay} Parts & Charger | Total Solution Hub`;
  const description = machineModel?.meta_description || 
    `Complete parts compatibility for ${brandDisplay} ${modelDisplay}. ` +
    `${voltage ? `${voltage}V charger, ` : ''}` +
    `${itaClass ? `Class ${itaClass} forks, ` : ''}` +
    `attachments & more. Verified 2026 Fleet Specs.`;

  return {
    title,
    description,
    keywords: [
      `${brandDisplay.toLowerCase()} ${modelDisplay.toLowerCase()} charger`,
      `${brandDisplay.toLowerCase()} ${modelDisplay.toLowerCase()} parts`,
      `${brandDisplay.toLowerCase()} ${modelDisplay.toLowerCase()} forks`,
      itaClass ? `class ${itaClass} forks` : '',
      voltage ? `${voltage}v forklift charger` : '',
      'forklift compatibility',
      'equipment parts',
    ].filter(Boolean),
    openGraph: {
      title: `${brandDisplay} ${modelDisplay} Total Solution Hub`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `https://www.flatearthequipment.com/compatibility/${params.brand}/${params.model}`,
    },
  };
}

// =============================================================================
// Schema.org Generator - Enhanced with SubjectOf
// =============================================================================

function generateEnhancedSchema(
  machineModel: MachineModel | null,
  compatibility: CompatibilityEntry | null,
  stripeProduct: ProductWithMetadata | null,
  url: string
): object[] {
  const schemas: object[] = [];
  
  const brandDisplay = machineModel?.brand || compatibility?.brand || 'Unknown';
  const modelDisplay = machineModel?.model_name || compatibility?.model || 'Unknown';
  const product = compatibility?.products[0];

  // BreadcrumbList Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flatearthequipment.com' },
      { '@type': 'ListItem', position: 2, name: 'Compatibility Hub', item: 'https://www.flatearthequipment.com/compatibility' },
      { '@type': 'ListItem', position: 3, name: brandDisplay, item: `https://www.flatearthequipment.com/compatibility/${machineModel?.brand_slug || brandDisplay.toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: modelDisplay, item: url },
    ],
  });

  // Product Schema with SubjectOf
  if (product && stripeProduct) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${product.productName} - ${brandDisplay} ${modelDisplay} Replacement`,
      description: `Verified replacement charger for ${brandDisplay} ${modelDisplay}. ${product.oemRef ? `Replaces OEM part ${product.oemRef}.` : ''}`,
      brand: {
        '@type': 'Brand',
        name: product.productName.includes('Delta-Q') ? 'Delta-Q' : 
              product.productName.includes('SPE') ? 'SPE' : 'Flat Earth Equipment',
      },
      sku: product.partNumber,
      // SubjectOf links the part TO the machine
      isRelatedTo: {
        '@type': 'Product',
        name: `${brandDisplay} ${modelDisplay}`,
        brand: { '@type': 'Brand', name: brandDisplay },
        model: modelDisplay,
        category: machineModel?.equipment_type || 'Industrial Equipment',
      },
      // Additional machine-specific properties
      additionalProperty: [
        machineModel?.voltage && {
          '@type': 'PropertyValue',
          name: 'Battery Voltage',
          value: `${machineModel.voltage}V`,
        },
        machineModel?.ita_class && {
          '@type': 'PropertyValue',
          name: 'ITA Fork Class',
          value: `Class ${machineModel.ita_class}`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Verification Status',
          value: '2026 Fleet Compliant',
        },
      ].filter(Boolean),
      offers: stripeProduct?.defaultPrice ? {
        '@type': 'Offer',
        price: (stripeProduct.defaultPrice.unitAmount! / 100).toFixed(2),
        priceCurrency: stripeProduct.defaultPrice.currency.toUpperCase(),
        availability: 'https://schema.org/InStock',
        url,
        seller: { '@type': 'Organization', name: 'Flat Earth Equipment' },
      } : undefined,
    });
  }

  return schemas;
}

// =============================================================================
// Equipment Type Display
// =============================================================================

const equipmentTypeLabels: Record<string, { label: string; icon: string }> = {
  forklift: { label: 'Electric Forklift', icon: '🏭' },
  scissor_lift: { label: 'Scissor Lift', icon: '📐' },
  boom_lift: { label: 'Boom Lift', icon: '🏗️' },
  pallet_jack: { label: 'Pallet Jack', icon: '📦' },
  utility_vehicle: { label: 'Utility Vehicle', icon: '🚗' },
  floor_scrubber: { label: 'Floor Scrubber', icon: '🧹' },
  telehandler: { label: 'Telehandler', icon: '🔧' },
};

// =============================================================================
// Page Component
// =============================================================================

export default async function CompatibilityPage({ params }: PageProps) {
  // Fetch from Supabase
  const machineModel = await getMachineModel(params.brand, params.model);
  
  // Fall back to static compatibility data
  const compatibility = getCompatibilityBySlug(params.brand, params.model);
  
  if (!machineModel && !compatibility) {
    notFound();
  }

  // Determine display values
  const brandDisplay = machineModel?.brand || compatibility?.brand || params.brand;
  const modelDisplay = machineModel?.model_name || compatibility?.model || params.model;
  const product = compatibility?.products[0];
  
  // Fetch Stripe product data
  const chargerId = machineModel?.recommended_charger_id || product?.stripeProductId;
  const stripeProduct = chargerId ? await getStripeProduct(chargerId) : null;
  const metadata = stripeProduct?.metadata || {};

  // Fetch repair module if exists
  const repairModuleId = machineModel?.repair_module_id || compatibility?.repairComponents?.[0]?.stripeProductId;
  const repairModule = repairModuleId ? await getStripeProduct(repairModuleId) : null;

  // Fetch OEM parts for this model (quote_only items)
  const oemParts = await getOEMPartsForModel(params.brand, params.model);

  // Generate Schema.org markup
  const pageUrl = `https://www.flatearthequipment.com/compatibility/${params.brand}/${params.model}`;
  const schemas = generateEnhancedSchema(machineModel, compatibility || null, stripeProduct, pageUrl);

  // Find related models from same brand
  const relatedModels = COMPATIBILITY_DATA.filter(
    entry => entry.brand.toLowerCase() === brandDisplay.toLowerCase() && 
             entry.slug !== (machineModel?.slug || compatibility?.slug)
  ).slice(0, 4);

  // Equipment type info
  const equipmentType = machineModel?.equipment_type || 'forklift';
  const equipmentInfo = equipmentTypeLabels[equipmentType] || equipmentTypeLabels.forklift;

  // ITA Class and Fork recommendations
  const itaClass = machineModel?.ita_class;
  const defaultForkClass = machineModel?.default_fork_class;

  return (
    <>
      {/* JSON-LD Schema */}
      {schemas.map((schema, idx) => (
        <Script
          key={idx}
          id={`schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 sm:pb-12">
        {/* Enhanced Breadcrumb - Home > Compatibility > [Brand] > [Model] */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link href="/compatibility" className="hover:text-canyon-rust transition-colors">
                Compatibility Hub
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link 
                href={`/compatibility/${params.brand}`} 
                className="hover:text-canyon-rust transition-colors"
              >
                {brandDisplay}
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium">{modelDisplay}</li>
          </ol>
        </nav>

        {/* Hero Header with Verification Badge */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 lg:p-12 mb-10 text-white">
          <div className="max-w-4xl">
            {/* Verification Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Verified 2026 Fleet Specs
              </span>
              <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-medium rounded-full flex items-center gap-1.5">
                <span>{equipmentInfo.icon}</span>
                {equipmentInfo.label}
              </span>
              {machineModel?.voltage_options && machineModel.voltage_options.length > 1 ? (
                <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <Battery className="w-4 h-4" />
                  {machineModel.voltage_options.join('V / ')}V Options
                </span>
              ) : machineModel?.voltage && (
                <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <Battery className="w-4 h-4" />
                  {machineModel.voltage}V System
                </span>
              )}
              {itaClass && itaClass !== 'N/A' && (
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <Grid3X3 className="w-4 h-4" />
                  ITA Class {itaClass}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              {brandDisplay} {modelDisplay}
              <span className="block text-xl lg:text-2xl text-slate-300 font-normal mt-2">
                Total Solution Dashboard
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-6">
              Complete parts compatibility hub for your {brandDisplay} {modelDisplay}. 
              Find verified chargers, forks, and attachments — all in one place.
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {machineModel?.voltage_options && machineModel.voltage_options.length > 1 ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Voltage Options</p>
                    <p className="font-semibold">{machineModel.voltage_options.join('V / ')}V</p>
                  </div>
                </div>
              ) : machineModel?.voltage && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Voltage</p>
                    <p className="font-semibold">{machineModel.voltage}V</p>
                  </div>
                </div>
              )}
              {machineModel?.capacity_lbs && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Box className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Capacity</p>
                    <p className="font-semibold">{machineModel.capacity_lbs.toLocaleString()} lbs</p>
                  </div>
                </div>
              )}
              {itaClass && itaClass !== 'N/A' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fork Class</p>
                    <p className="font-semibold">ITA Class {itaClass}</p>
                  </div>
                </div>
              )}
              {machineModel?.battery_connector && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Cog className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Connector</p>
                    <p className="font-semibold">{machineModel.battery_connector}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === SECTION 1: PRIMARY CHARGER RECOMMENDATION === */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-canyon-rust/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-canyon-rust" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Primary Charger Recommendation</h2>
              <p className="text-slate-600">Verified complete charger system for your {modelDisplay}</p>
            </div>
          </div>

          {/* Voltage Confirmation Wrapper - locks cart until voltage confirmed for multi-voltage models */}
          <VoltageConfirmationWrapper
            brand={brandDisplay}
            modelName={modelDisplay}
            voltageOptions={machineModel?.voltage_options || null}
            requiresVoltageConfirmation={machineModel?.requires_voltage_confirmation || false}
            currentVoltage={machineModel?.voltage}
          >
          {product && stripeProduct ? (
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 flex items-center justify-between">
                <span className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Complete Charger System — Verified Fit
                </span>
                {metadata.is_complete_system === 'true' && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                    Complete System
                  </span>
                )}
              </div>
              
              <div className="p-6 lg:p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Product Info */}
                  <div className="lg:col-span-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                      {product.productName.includes('Delta-Q') ? 'Delta-Q' : 
                       product.productName.includes('SPE') ? 'SPE' : 'Charger'}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{product.productName}</h3>
                    <p className="text-slate-600 mb-4">{product.partNumber}</p>

                    {/* OEM Reference */}
                    {(machineModel?.oem_part_ref || product.oemRef) && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-6 inline-block">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Replaces {brandDisplay} OEM Part
                        </p>
                        <code className="text-lg font-mono font-bold text-slate-900">
                          {machineModel?.oem_part_ref || product.oemRef}
                        </code>
                      </div>
                    )}

                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        6-Month Warranty
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Same-Day Shipping
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Wrench className="w-4 h-4 text-amber-600" />
                        Plug & Play Install
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Manual Included
                      </div>
                    </div>

                    {/* Pro Tip */}
                    {metadata.seo_pro_tip && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-1">💡 Pro Tip</p>
                        <p className="text-sm text-blue-800">{metadata.seo_pro_tip}</p>
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="lg:border-l lg:pl-8">
                    {stripeProduct.defaultPrice?.unitAmount && (
                      <div className="mb-6">
                        <p className="text-sm text-slate-500 mb-1">Starting at</p>
                        <p className="text-4xl font-bold text-canyon-rust">
                          ${(stripeProduct.defaultPrice.unitAmount / 100).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <QuoteButton 
                        product={{
                          name: `${product.productName} for ${brandDisplay} ${modelDisplay}`,
                          slug: product.productSlug,
                          sku: product.partNumber,
                        }}
                      />
                      <Link
                        href={`/chargers/${machineModel?.recommended_charger_slug || product.productSlug}`}
                        className="block w-full text-center px-4 py-3 border-2 border-slate-200 text-slate-700 font-medium rounded-lg hover:border-canyon-rust hover:text-canyon-rust transition-colors"
                      >
                        View Full Specs →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Charger recommendation not yet available for this model.</p>
              <Link href="/battery-chargers" className="text-canyon-rust font-medium hover:underline">
                Browse All Chargers →
              </Link>
            </div>
          )}
          </VoltageConfirmationWrapper>
        </section>

        {/* === SECTION 2: INTEGRATED FORK FINDER === */}
        {itaClass && itaClass !== 'N/A' && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Verified Fit Forks</h2>
                <p className="text-slate-600">ITA Class {itaClass} forks compatible with {modelDisplay}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3">
                <span className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Class {defaultForkClass || itaClass} Hook-Type Forks — Verified for {brandDisplay}
                </span>
              </div>
              
              <div className="p-6">
                {/* Fork Class Info */}
                <TechnicalSpecsTable 
                  title={`ITA Class ${defaultForkClass || itaClass} Fork Specifications`}
                  specs={FORK_SPECS}
                  showClassComparison={false}
                  footnote={`Specifications per ITA/ISO 2328. All forks verified for ${brandDisplay} ${modelDisplay} carriage dimensions.`}
                />

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={`/forks?class=${defaultForkClass || itaClass}`}
                    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Shop Class {defaultForkClass || itaClass} Forks
                  </Link>
                  <Link
                    href="/forks"
                    className="px-6 py-3 border-2 border-purple-200 text-purple-700 font-medium rounded-lg hover:border-purple-400 transition-colors"
                  >
                    View All Fork Options
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === SECTION 3: ATTACHMENT FINDER PLACEHOLDER === */}
        {itaClass && itaClass !== 'N/A' && machineModel?.capacity_lbs && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Cog className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Compatible Attachments</h2>
                <p className="text-slate-600">Side shifters, rotators & more for {modelDisplay}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-lg">↔️</div>
                    <span className="font-semibold text-slate-900">Side Shifters</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Class {itaClass} compatible, up to {machineModel.capacity_lbs.toLocaleString()} lb capacity
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-lg">🔄</div>
                    <span className="font-semibold text-slate-900">Fork Positioners</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Hydraulic fork spread adjustment for varied pallet sizes
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-lg">📦</div>
                    <span className="font-semibold text-slate-900">Clamp Attachments</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Paper roll, carton, and bale clamps available
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-4 border border-amber-300">
                <div>
                  <p className="font-semibold text-amber-900">Need a specific attachment?</p>
                  <p className="text-sm text-amber-800">Our team can verify fitment for any attachment type.</p>
                </div>
                <Link
                  href="/quote"
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* === SECTION 4: COMMON WEAR PARTS (OEM) === */}
        {oemParts.length > 0 && (
          <OEMPartsSection
            parts={oemParts}
            machineBrand={brandDisplay}
            machineModel={modelDisplay}
          />
        )}

        {/* === SECTION 5: REPAIR COMPONENTS === */}
        {(repairModule || compatibility?.repairComponents?.length) && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Related Repair Components</h2>
                <p className="text-slate-600">Internal modules for existing charger cabinets</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">
                  <strong>Note:</strong> These are internal repair components for technicians. 
                  If you need a complete charger replacement, use the primary recommendation above.
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {(compatibility?.repairComponents || []).map((component) => (
                  <div
                    key={component.stripeProductId}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{component.productName}</p>
                    <code className="text-sm font-mono text-slate-600">{component.partNumber}</code>
                    {component.description && (
                      <p className="text-sm text-slate-600 mt-2">{component.description}</p>
                    )}
                    <Link
                      href={`/chargers/${component.productSlug}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-slate-700 hover:text-canyon-rust transition-colors"
                    >
                      View Component <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === SECTION 5: TECHNICAL SPECS & TROUBLESHOOTING === */}
        {(Object.keys(metadata).length > 0 || metadata.fault_codes) && (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Technical Specifications */}
            {Object.keys(metadata).some(k => k.startsWith('spec_')) && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
                <TechnicalSpecsTable
                  title={`${product?.productName || 'Charger'} Specs`}
                  metadata={metadata}
                />
              </section>
            )}

            {/* Troubleshooting Guide */}
            {metadata.fault_codes && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Troubleshooting Guide</h2>
                <ProductSupportFAQ
                  faultCodes={metadata.fault_codes}
                  productName={`${brandDisplay} ${modelDisplay} charger`}
                  includeSchema={true}
                  manualUrl={metadata.manual_url}
                />
              </section>
            )}
          </div>
        )}

        {/* === SECTION 6: RELATED MODELS === */}
        {relatedModels.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Other {brandDisplay} Models We Support
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

        {/* === CROSS-TOOL CTA === */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Don't Know Your Model?</h2>
            <p className="text-slate-300">Use our standalone tools to find the right parts</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/battery-chargers"
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold group-hover:text-canyon-rust transition-colors">Charger Selector</p>
                <p className="text-sm text-slate-400">Find by voltage & specs</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-slate-500 group-hover:text-white transition-colors" />
            </Link>
            
            <Link
              href="/forks"
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold group-hover:text-canyon-rust transition-colors">Fork Finder</p>
                <p className="text-sm text-slate-400">Search by ITA class</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-slate-500 group-hover:text-white transition-colors" />
            </Link>
            
            <Link
              href="/compatibility"
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors group sm:col-span-2 lg:col-span-1"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold group-hover:text-canyon-rust transition-colors">All Brands</p>
                <p className="text-sm text-slate-400">Browse compatibility hub</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
