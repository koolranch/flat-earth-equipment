import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { 
  COMPATIBILITY_DATA, 
  getAllBrands,
  getCompatibilityByBrand,
} from '@/lib/compatibility-data';
import { 
  ShieldCheck, 
  ArrowRight, 
  Wrench, 
  Calendar, 
  Search,
  CheckCircle,
  Zap,
  Truck,
} from 'lucide-react';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Universal Compatibility Hub | Equipment Charger Fitment Guide',
  description: 'Find the right replacement charger for your forklift, scissor lift, or aerial work platform. Verified OEM fitment for JLG, Genie, Toyota, Hyster, Yale, and more. 2026 Fleet Compliant.',
  keywords: [
    'forklift charger compatibility',
    'scissor lift charger replacement',
    'aerial lift battery charger',
    'jlg charger replacement',
    'genie charger replacement',
    'toyota forklift charger',
    'hyster forklift charger',
    'yale forklift charger',
    'oem charger cross reference',
    'industrial charger fitment',
  ],
  alternates: {
    canonical: 'https://www.flatearthequipment.com/compatibility',
  },
};

// =============================================================================
// Schema.org ItemList Markup
// =============================================================================

function generateCollectionSchema() {
  const brands = getAllBrands();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Universal Compatibility Hub',
    description: 'Find verified replacement chargers for industrial equipment including forklifts, scissor lifts, and aerial work platforms.',
    url: 'https://www.flatearthequipment.com/compatibility',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: brands.map((brand, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Brand',
          name: brand,
          url: `https://www.flatearthequipment.com/compatibility/${brand.toLowerCase()}`,
        },
      })),
    },
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default function CompatibilityHubPage() {
  const brands = getAllBrands();
  
  // Group brands by equipment type for better organization
  const scissorLiftBrands = ['JLG', 'Genie', 'Skyjack', 'BT'];
  const forkliftBrands = ['Toyota', 'Hyster', 'Yale', 'Jungheinrich', 'Cat'];
  const utilityVehicleBrands = ['EZGO', 'Cushman', 'Taylor-Dunn'];

  // Brand stats
  const brandStats = brands.map(brand => ({
    brand,
    count: getCompatibilityByBrand(brand).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <>
      {/* JSON-LD Schema */}
      <Script
        id="compatibility-hub-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCollectionSchema()) }}
      />

      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 sm:pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 lg:p-12 mb-10 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Verified OEM Fitment
              </span>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold rounded-full flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                2026 Fleet Compliant
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Universal Compatibility Hub
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mb-8">
              Find the exact replacement charger for your equipment. Every fitment is 
              verified against OEM specifications and tested for fleet compliance.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-canyon-rust/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-canyon-rust" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{COMPATIBILITY_DATA.length}</p>
                    <p className="text-sm text-slate-400">Equipment Models</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{brands.length}</p>
                    <p className="text-sm text-slate-400">Brands Supported</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24hr</p>
                    <p className="text-sm text-slate-400">Same-Day Ship</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">6mo</p>
                    <p className="text-sm text-slate-400">Warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search CTA */}
        <div className="bg-slate-50 rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-canyon-rust/10 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-canyon-rust" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Can't find your model?</p>
              <p className="text-sm text-slate-600">Contact us for a free compatibility check</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 bg-canyon-rust text-white rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors flex items-center gap-2"
          >
            Request Compatibility Check
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scissor Lifts & Aerial Equipment */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏗️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Scissor Lifts & Aerial Equipment</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scissorLiftBrands.filter(b => brands.includes(b)).map(brand => {
              const models = getCompatibilityByBrand(brand);
              return (
                <Link
                  key={brand}
                  href={`/compatibility/${brand.toLowerCase()}`}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-600">
                        {brand.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                    {brand}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {models.length} models supported
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Forklifts */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🚜</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Forklifts & Material Handling</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forkliftBrands.filter(b => brands.includes(b)).map(brand => {
              const models = getCompatibilityByBrand(brand);
              return (
                <Link
                  key={brand}
                  href={`/compatibility/${brand.toLowerCase()}`}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">
                        {brand.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                    {brand}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {models.length} models supported
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Utility Vehicles */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🚗</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Utility Vehicles & Golf Carts</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilityVehicleBrands.filter(b => brands.includes(b)).map(brand => {
              const models = getCompatibilityByBrand(brand);
              return (
                <Link
                  key={brand}
                  href={`/compatibility/${brand.toLowerCase()}`}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {brand.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {brand}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {models.length} models supported
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* All Brands */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Supported Brands</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-slate-900">Brand</th>
                    <th className="text-center px-6 py-4 font-semibold text-slate-900">Models</th>
                    <th className="text-right px-6 py-4 font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brandStats.map(({ brand, count }) => (
                    <tr key={brand} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/compatibility/${brand.toLowerCase()}`}
                          className="font-medium text-slate-900 hover:text-canyon-rust transition-colors"
                        >
                          {brand}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-sm font-semibold text-slate-700">
                          {count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/compatibility/${brand.toLowerCase()}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-canyon-rust hover:underline"
                        >
                          View Models
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
              Why Trust Our Compatibility Data?
            </h2>
            <p className="text-slate-600 mb-8">
              Every charger-to-equipment match in our database is verified through multiple sources 
              including OEM parts manuals, field technician feedback, and physical testing in our facility.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">OEM Verified</h3>
                <p className="text-sm text-slate-600">
                  Cross-referenced with official parts catalogs and service manuals
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Field Tested</h3>
                <p className="text-sm text-slate-600">
                  Validated by our network of certified field technicians
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">6-Month Warranty</h3>
                <p className="text-sm text-slate-600">
                  We stand behind our fitment data with a full warranty
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

