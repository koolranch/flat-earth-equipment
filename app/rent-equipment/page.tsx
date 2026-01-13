import { supabaseServer } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import slugify from "slugify";
import { getUserLocale } from '@/lib/getUserLocale';

export const metadata: Metadata = {
  title: "Equipment Rentals | Flat Earth Equipment",
  description:
    "Rent forklifts, boom lifts, scissor lifts, telehandlers, and more from top brands with fast availability.",
  alternates: { canonical: "/rent-equipment" },
};

interface RentalEquipment {
  category: string;
}

interface CategoryWithCount {
  name: string;
  count: number;
}

async function fetchRentalCategories(): Promise<CategoryWithCount[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("rental_equipment")
    .select("category")
    .order("category", { ascending: true });

  if (error) throw error;

  // Count equipment per category
  const categoryCountMap: Record<string, number> = {};
  data.forEach((item: RentalEquipment) => {
    // Normalize category name (convert to title case, handle singular/plural)
    let category = item.category.toLowerCase();
    if (category.endsWith('s') && !category.endsWith('ss')) {
      category = category.slice(0, -1);
    }
    categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
  });

  // Convert to array with counts
  const categoriesWithCounts: CategoryWithCount[] = Object.entries(categoryCountMap).map(([name, count]) => ({
    name,
    count
  }));

  return categoriesWithCounts;
}

import RentalTrustBadges from "@/components/rental/RentalTrustBadges";

export default async function RentEquipmentPage() {
  const categoriesWithCounts = await fetchRentalCategories();
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Equipment Rentals',
      intro: 'We offer a wide selection of industrial rental equipment from trusted brands such as Genie, JLG, Skyjack, Toyota, and Bobcat. Select a category below to see available models, detailed specs, and request a rental quote.',
      viewModels: 'View available models & rental options'
    },
    es: {
      title: 'Alquiler de Equipos',
      intro: 'Ofrecemos una amplia selección de equipos de alquiler industriales de marcas confiables como Genie, JLG, Skyjack, Toyota y Bobcat. Seleccione una categoría a continuación para ver modelos disponibles, especificaciones detalladas y solicitar una cotización de alquiler.',
      viewModels: 'Ver modelos disponibles y opciones de alquiler'
    }
  }[locale]

  // Map Mini Skid Steer to Compact Utility Loader for display and slug
  const displayCategories = categoriesWithCounts.map((cat) => {
    if (cat.name.toLowerCase() === 'mini skid steer') {
      return { name: 'Compact Utility Loader', count: cat.count };
    }
    return cat;
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script id="service-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Equipment Rental",
          "provider": {
            "@type": "Organization",
            "name": "Flat Earth Equipment",
            "url": "https://www.flatearthequipment.com"
          },
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          }
        })}
      </Script>

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-canyon-rust px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span>🏗️</span> Industrial Equipment Rentals
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t.title}
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
        {t.intro}
      </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">70+</div>
                  <div className="text-sm text-slate-300">Equipment Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">7</div>
                  <div className="text-sm text-slate-300">Equipment Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">24hr</div>
                  <div className="text-sm text-slate-300">Quote Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">5 States</div>
                  <div className="text-sm text-slate-300">Service Area</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#categories"
                  className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
                >
                  Browse Equipment
                </Link>
                <Link
                  href="/quote"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors"
                >
                  Request Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Trust Badges - NEW */}
          <RentalTrustBadges />
          
          {/* Key Benefits - Removed old version in favor of new badges */}
          <section className="mb-16 hidden">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Why Choose Our Equipment Rentals?</h2>
            {/* ... old benefits ... */}
          </section>

          {/* Equipment Categories */}
          <section id="categories">
            <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">Equipment Categories</h2>
            <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
              Browse our comprehensive selection of industrial equipment from leading manufacturers
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCategories.map((categoryData) => {
                const category = categoryData.name;
                const categoryCount = categoryData.count;
                
                // Get category icon (professional SVG)
                const getIcon = (cat: string) => {
                  const lower = cat.toLowerCase();
                  const iconClass = "w-12 h-12 text-canyon-rust mx-auto mb-4";
                  
                  if (lower.includes('boom')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 7-7-7z" />
                      </svg>
                    );
                  }
                  if (lower.includes('scissor')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12V7a5 5 0 0110 0v5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16h10" />
                      </svg>
                    );
                  }
                  if (lower.includes('forklift')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    );
                  }
                  if (lower.includes('telehandler')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  }
                  if (lower.includes('skid') || lower.includes('compact')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    );
                  }
                  if (lower.includes('attachment')) {
                    return (
                      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    );
                  }
                  return (
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  );
                };

                return (
          <Link
            key={category}
            href={`/rentals/${slugify(category, { lower: true })}`}
            className="group block rounded-2xl border border-slate-200 bg-white hover:border-canyon-rust/30 hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{getIcon(category)}</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-canyon-rust transition-colors">
                {category}
              </h2>
              <div className="inline-flex items-center justify-center bg-slate-50 px-3 py-1 rounded-full mb-4">
                <span className="text-xs font-semibold text-slate-600">{categoryCount} Models Available</span>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{t.viewModels}</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-canyon-rust tracking-wide group-hover:gap-3 transition-all">
                <span>BROWSE EQUIPMENT</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
                );
              })}
            </div>
          </section>

          {/* Call to Action */}
          <section className="mt-20 bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Equipment for Your Project?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get a custom quote for your specific equipment needs. Our rental experts will find the perfect solution for your project.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="bg-white text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Request Custom Quote
          </Link>
              
              <a
                href="tel:+1-888-392-9175"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-canyon-rust transition-colors"
              >
                Call (888) 392-9175
              </a>
            </div>
      </section>
        </div>
    </main>
    </>
  );
} 