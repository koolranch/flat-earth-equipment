import { supabaseServer } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import slugify from "slugify";
import { getUserLocale } from '@/lib/getUserLocale';

export const metadata: Metadata = {
  title: "Equipment Rentals | Flat Earth Equipment",
  description:
    "Rental categories listed on this page. Ask for a quote. This page does not publish local delivery.",
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

const CATEGORY_ILLUSTRATIONS: { match: string; src: string }[] = [
  { match: 'boom', src: '/rental-illustrations/boom-lift.svg' },
  { match: 'scissor', src: '/rental-illustrations/scissor-lift.svg' },
  { match: 'forklift', src: '/rental-illustrations/forklift.svg' },
  { match: 'telehandler', src: '/rental-illustrations/telehandler.svg' },
  { match: 'skid', src: '/rental-illustrations/skid-steer.svg' },
  { match: 'compact', src: '/rental-illustrations/compact-utility-loader.svg' },
  { match: 'attachment', src: '/rental-illustrations/attachments.svg' },
];

function getCategoryIllustration(category: string): string {
  const lower = category.toLowerCase();
  const found = CATEGORY_ILLUSTRATIONS.find((item) => lower.includes(item.match));
  return found ? found.src : '/rental-illustrations/attachments.svg';
}

export default async function RentEquipmentPage() {
  const categoriesWithCounts = await fetchRentalCategories();
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Equipment Rentals',
      intro: 'The categories below are the rental listings on this page. Ask for a quote. This page does not publish local delivery.',
      viewModels: 'View available models & rental options'
    },
    es: {
      title: 'Alquiler de Equipos',
      intro: 'Las categorías de abajo son los alquileres de esta página. Pida una cotización. Esta página no publica entrega local.',
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
                Industrial Equipment Rentals
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t.title}
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
        {t.intro}
      </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">70+</div>
                  <div className="text-sm text-slate-300">Equipment Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">7</div>
                  <div className="text-sm text-slate-300">Equipment Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-canyon-rust">Quote</div>
                  <div className="text-sm text-slate-300">Rate comes back on the quote</div>
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
                
                const illustration = getCategoryIllustration(category);

                return (
          <Link
            key={category}
            href={`/rentals/${slugify(category, { lower: true })}`}
            className="group block rounded-2xl border border-slate-200 bg-white hover:border-canyon-rust/30 hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="mb-6 flex h-32 items-center justify-center rounded-xl bg-slate-50 transition-colors duration-300 group-hover:bg-orange-50/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={illustration}
                  alt=""
                  aria-hidden="true"
                  className="h-28 w-auto transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h2 className="text-xl font-bold capitalize text-slate-900 mb-3 group-hover:text-canyon-rust transition-colors">
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