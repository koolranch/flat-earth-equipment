import { brands } from "@/lib/data/brands";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Shop by Brand | Flat Earth Equipment",
  description:
    "Explore parts by top equipment brands like Genie, Doosan, Caterpillar, and more. 40+ supported brands with fast quotes and same-day shipping.",
};

export const revalidate = 3600;

export default async function BrandsPage() {
  const supabase = createClient();

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Browse by Brand
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Explore parts, serial number lookup tools, and fault code databases for 45+ equipment brands. 
          Click any brand to access comprehensive resources.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-slate-900">Serial Lookup</div>
          <div className="text-sm text-slate-600">Find year & plate locations</div>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-semibold text-slate-900">Fault Codes</div>
          <div className="text-sm text-slate-600">Diagnostic guidance</div>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl mb-2">📖</div>
          <div className="font-semibold text-slate-900">Service Guides</div>
          <div className="text-sm text-slate-600">Maintenance tips</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search brands..."
            className="w-full px-4 py-3 pl-10 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
            id="brand-search"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Popular Brands Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Most Popular Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto">
          {['toyota', 'hyster', 'genie', 'jlg', 'bobcat', 'caterpillar'].map((popularSlug) => {
            const brand = brands.find(b => b.slug.toLowerCase() === popularSlug);
            if (!brand) return null;
            
            const brandSlug = brand.slug.toLowerCase().replace(/[\s_]+/g, "-");
            const pngBrands = ["enersys", "liugong"];
            const ext = pngBrands.includes(brandSlug) ? "png" : "webp";
            const { data: { publicUrl: logoUrl } } = supabase
              .storage
              .from("brand-logos")
              .getPublicUrl(`${brandSlug}.${ext}`);

            return (
              <Link
                key={brand.slug}
                href={`/brand/${brand.slug}`}
                className="group text-center p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-canyon-rust hover:shadow-lg transition-all"
              >
                <img
                  src={logoUrl}
                  alt={`${brand.name} logo`}
                  className="h-12 mx-auto object-contain group-hover:opacity-80 mb-3"
                />
                <p className="text-sm text-slate-600 group-hover:text-canyon-rust font-medium">
                  {brand.name}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Brands Grid */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">All Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" id="all-brands">
          {brands.map((brand) => {
            // Normalize slug: lowercase, spaces & underscores → hyphens
            const brandSlug = brand.slug.toLowerCase().replace(/[\s_]+/g, "-");

            // Use .png for these brands, otherwise .webp
            const pngBrands = ["enersys", "liugong"];
            const ext = pngBrands.includes(brandSlug) ? "png" : "webp";

            // Build path & get public URL
            const { data: { publicUrl: logoUrl } } = supabase
              .storage
              .from("brand-logos")
              .getPublicUrl(`${brandSlug}.${ext}`);

            // Determine equipment type for badge
            const getEquipmentType = (name: string) => {
              const lower = name.toLowerCase();
              if (lower.includes('forklift') || ['toyota', 'hyster', 'yale', 'crown', 'clark', 'raymond', 'unicarriers'].includes(brandSlug)) return 'Forklifts';
              if (['genie', 'jlg', 'skyjack', 'haulotte', 'snorkel'].includes(brandSlug)) return 'Aerial';
              if (['bobcat', 'case', 'caterpillar', 'jcb', 'takeuchi', 'kubota'].includes(brandSlug)) return 'Construction';
              if (['tennant', 'karcher', 'powerboss'].includes(brandSlug)) return 'Cleaning';
              return 'Industrial';
            };

            return (
              <Link
                key={brand.slug}
                href={`/brand/${brand.slug}`}
                className="group text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-canyon-rust hover:shadow-md transition-all duration-200 brand-card"
                data-brand-name={brand.name.toLowerCase()}
              >
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-12 mx-auto object-contain group-hover:opacity-80 mb-3"
                  />
                  <div className="absolute -top-2 -right-2 bg-canyon-rust/10 text-canyon-rust px-2 py-1 rounded-full text-xs font-medium">
                    {getEquipmentType(brand.name)}
                  </div>
                </div>
                <p className="text-sm text-slate-700 group-hover:text-canyon-rust font-medium">
                  {brand.name}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Search functionality */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('brand-search');
            const brandCards = document.querySelectorAll('.brand-card');
            
            searchInput.addEventListener('input', function(e) {
              const searchTerm = e.target.value.toLowerCase();
              
              brandCards.forEach(card => {
                const brandName = card.getAttribute('data-brand-name');
                if (brandName.includes(searchTerm)) {
                  card.style.display = 'block';
                } else {
                  card.style.display = 'none';
                }
              });
            });
          });
        `
      }} />

      <p className="mt-4 text-center text-xs text-slate-500">
        <strong>Not an Authorized Dealer.</strong> Flat Earth Equipment partners with trusted suppliers to deliver OEM-spec and remanufactured parts—fully warrantied and ready to ship.
      </p>

      <p className="mt-12 text-center text-slate-500 text-sm">
        Don't see your brand?{" "}
        <Link href="/contact" className="text-canyon-rust underline">
          Request it here
        </Link>
        .
      </p>
    </main>
  );
} 