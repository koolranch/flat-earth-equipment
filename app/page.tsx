import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import { Features } from "@/components/ui/Features";
import EmailSignup from "@/components/EmailSignup";
import QuickQuote from "@/components/QuickQuote";
import Testimonials from "@/components/Testimonials";
import FeaturedRentals from "@/components/FeaturedRentals";
import FeaturedProducts from "@/components/FeaturedProducts";
import Script from 'next/script';
import { Metadata } from 'next';
import Link from 'next/link';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from './seo-defaults';

export const metadata: Metadata = {
  title: 'Flat Earth Equipment | Flat Earth Equipment',
  description: 'Your one-stop shop for high-quality, precision-fit replacement industrial equipment parts and rentals.',
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
      quoteButton: 'Request Rental Quote',
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
      quoteButton: 'Solicitar Cotización de Alquiler',
      lastUpdated: 'Página actualizada por última vez: Mayo 2025'
    }
  }[locale]

  return (
    <main>
      {/* Structured Data for Homepage */}
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Flat Earth Equipment",
          url: "https://www.flatearthequipment.com",
          logo: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp",
          description: "Industrial equipment parts and rentals. Same-day shipping. Western-tough, nationwide.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Sheridan",
            addressRegion: "WY",
            postalCode: "82801",
            addressCountry: "US"
          }
        })}
      </Script>

      {/* 1) Full-bleed Hero */}
      <Hero locale={locale} />

      {/* Featured Rentals */}
      <div className="py-12">
        <FeaturedRentals />
      </div>

      {/* Featured Products */}
      <FeaturedProducts />


      {/* 4) Featured Products grid */}
      <section className="py-12">
        <FeaturedParts />
      </section>

      {/* 5) Value-props Features */}
      <section className="py-12 bg-gray-50">
        <Features locale={locale} />
      </section>

      {/* 6) Brands grid */}
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

      {/* 7) Testimonials */}
      <Testimonials />

      {/* Geographic Coverage */}
      <section className="bg-slate-50 py-12 mt-16">
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

      {/* Safety Training CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-[#F76511] via-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>🎓</span> OSHA-Compliant Training
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Forklift Certified Online
          </h2>
          
          <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto">
            Interactive training with hands-on demos, micro-quizzes, and QR-verifiable certificates. 
            Meet OSHA 29 CFR 1910.178 requirements in hours, not days.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/safety"
              className="inline-flex items-center gap-2 bg-white text-[#F76511] px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Start Training →
            </Link>
            <Link
              href="/safety#pricing"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
            >
              See Pricing
            </Link>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <span>No long videos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <span>Interactive demos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <span>Instant certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <span>English & Spanish</span>
            </div>
          </div>
        </div>
      </section>


      {/* 12) Page Freshness Signal */}
      <p className="text-center text-xs text-slate-500 mt-8">
{t.lastUpdated}
      </p>
    </main>
  );
} 