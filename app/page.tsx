import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import { Features } from "@/components/ui/Features";
import Testimonials from "@/components/Testimonials";
import FeaturedRentals from "@/components/FeaturedRentals";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrainingCTA from "@/components/home/TrainingCTA";
import { Metadata } from 'next';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from './seo-defaults';

export const metadata: Metadata = {
  // `absolute` bypasses the "%s | Flat Earth Equipment" template in
  // app/seo-defaults.ts so the brand name doesn't appear twice.
  title: { absolute: 'Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More' },
  description: 'Get OSHA forklift certification online in under 30 minutes. Interactive training with instant certificates. Professional forklift parts & rentals shipped nationwide.',
  alternates: generatePageAlternates('/')
};

export const revalidate = 3600;

export default function Page() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      trustedBrands: 'Trusted Brands We Support',
      viewAllBrands: 'View All Brands →',
      servingWest: 'Serving the Western U.S.',
      servingDescription: 'From Wyoming to Texas, we deliver rugged rentals and precision-fit parts to contractors, fleets, and facilities across the West.',
      locations: {
        cheyenne: 'Cheyenne, WY',
        bozeman: 'Bozeman, MT', 
        pueblo: 'Pueblo, CO',
        dallasFortWorth: 'Dallas-Fort Worth, TX',
        elPaso: 'El Paso, TX',
        albuquerque: 'Albuquerque, NM',
        lasCruces: 'Las Cruces, NM'
      },
      lastUpdated: 'Page last updated: May 2025'
    },
    es: {
      trustedBrands: 'Marcas de Confianza que Apoyamos',
      viewAllBrands: 'Ver Todas las Marcas →',
      servingWest: 'Sirviendo el Oeste de EE.UU.',
      servingDescription: 'Desde Wyoming hasta Texas, entregamos alquileres resistentes y partes de ajuste preciso a contratistas, flotas e instalaciones en todo el Oeste.',
      locations: {
        cheyenne: 'Cheyenne, WY',
        bozeman: 'Bozeman, MT',
        pueblo: 'Pueblo, CO',
        dallasFortWorth: 'Dallas-Fort Worth, TX',
        elPaso: 'El Paso, TX',
        albuquerque: 'Albuquerque, NM',
        lasCruces: 'Las Cruces, NM'
      },
      lastUpdated: 'Página actualizada por última vez: Mayo 2025'
    }
  }[locale]

  return (
    <main>
      {/* Sitewide Organization JSON-LD lives in app/layout.tsx and already
          declares the brand entity with @id and PostalAddress. No per-page
          duplicate needed here. */}

      <Hero locale={locale} />

      <TrainingCTA />

      <section className="py-12">
        <FeaturedParts />
      </section>

      <FeaturedProducts />

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-center mb-6">{t.trustedBrands}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-center">
            {[
              { name: 'Genie', src: '/brand-logos/genie.webp' },
              { name: 'Gehl', src: '/brand-logos/gehl.webp' },
              { name: 'Hyster', src: '/brand-logos/hyster.webp' },
              { name: 'JCB', src: '/brand-logos/jcb.webp' },
              { name: 'Hangcha', src: '/brand-logos/hangcha.webp' },
              { name: 'JLG', src: '/brand-logos/jlg.webp' },
              { name: 'Kubota', src: '/brand-logos/kubota.webp' },
              { name: 'MEC', src: '/brand-logos/mec.webp' },
              { name: 'Skyjack', src: '/brand-logos/skyjack.webp' },
              { name: 'Snorkel', src: '/brand-logos/snorkel.webp' },
              { name: 'Toro', src: '/brand-logos/toro.webp' },
              { name: 'Toyota', src: '/brand-logos/toyota.webp' },
            ].map((brand) => (
              <div key={brand.name} className="flex flex-col items-center">
                <img
                  src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public${brand.src}`}
                  alt={`${brand.name} equipment parts and rentals`}
                  className="h-10 object-contain mb-2"
                  loading="lazy"
                  width={40}
                  height={40}
                />
                <span className="text-xs text-slate-600">{brand.name}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="/brands" className="text-sm text-orange-700 hover:underline">{t.viewAllBrands}</a>
          </div>
        </div>
      </section>

      <Testimonials />

      <FeaturedRentals />

      <section className="bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.servingWest}</h2>
          <p className="text-slate-600 text-sm mb-10 max-w-xl mx-auto">
            {t.servingDescription}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 text-sm text-slate-700">
            <a href="/wyoming/cheyenne" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">📍</div>
              {t.locations.cheyenne}
            </a>
            <a href="/montana/bozeman" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏔️</div>
              {t.locations.bozeman}
            </a>
            <a href="/colorado/pueblo" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏗️</div>
              {t.locations.pueblo}
            </a>
            <a href="/texas/dallas-fort-worth" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏙️</div>
              {t.locations.dallasFortWorth}
            </a>
            <a href="/texas/el-paso" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🌄</div>
              {t.locations.elPaso}
            </a>
            <a href="/new-mexico/albuquerque" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🎈</div>
              {t.locations.albuquerque}
            </a>
            <a href="/new-mexico/las-cruces" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🌵</div>
              {t.locations.lasCruces}
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <Features locale={locale} />
      </section>

      <p className="text-center text-xs text-slate-500 mt-8 pb-8">
        {t.lastUpdated}
      </p>
    </main>
  );
}
