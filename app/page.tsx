import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import { Features } from "@/components/ui/Features";
import CategoryTiles from "@/components/CategoryTiles";
import EmailSignup from "@/components/EmailSignup";
import QuickQuote from "@/components/QuickQuote";
import Testimonials from "@/components/Testimonials";
import WhyTrustUs from "./components/WhyTrustUs";
import FeaturedRentals from "@/components/FeaturedRentals";
import FeaturedProducts from "@/components/FeaturedProducts";
import Script from 'next/script';
import { Metadata } from 'next';
import Link from 'next/link';
import { getUserLocale } from '@/lib/getUserLocale';

export const metadata: Metadata = {
  title: 'Flat Earth Equipment | Flat Earth Equipment',
  description: 'Your one-stop shop for high-quality, precision-fit replacement industrial equipment parts and rentals.',
  alternates: { canonical: '/' }
};

export default function Page() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      trustedBrands: 'Trusted Brands We Support',
      viewAllBrands: 'View All Brands →',
      servingWest: 'Serving the Western U.S.',
      servingDescription: 'From Wyoming to New Mexico, we deliver rugged rentals and precision-fit parts to contractors, fleets, and facilities across the West.',
      locations: {
        cheyenne: 'Cheyenne, WY',
        bozeman: 'Bozeman, MT', 
        pueblo: 'Pueblo, CO',
        lasCruces: 'Las Cruces, NM'
      },
      helpSection: 'Need Help Choosing the Right Part?',
      helpItems: [
        'Not sure if a controller fits your Genie lift? We\'ll help you confirm compatibility.',
        'Need fast forklift parts in Wyoming or Montana? We ship same-day from regional hubs.',
        'Looking for a reliable scissor lift rental near you? Request a quote in 60 seconds.'
      ],
      quoteButton: 'Request Rental Quote',
      lastUpdated: 'Page last updated: May 2025'
    },
    es: {
      trustedBrands: 'Marcas de Confianza que Apoyamos',
      viewAllBrands: 'Ver Todas las Marcas →',
      servingWest: 'Sirviendo el Oeste de EE.UU.',
      servingDescription: 'Desde Wyoming hasta Nuevo México, entregamos alquileres resistentes y partes de ajuste preciso a contratistas, flotas e instalaciones en todo el Oeste.',
      locations: {
        cheyenne: 'Cheyenne, WY',
        bozeman: 'Bozeman, MT',
        pueblo: 'Pueblo, CO', 
        lasCruces: 'Las Cruces, NM'
      },
      helpSection: '¿Necesita Ayuda para Elegir la Parte Correcta?',
      helpItems: [
        '¿No está seguro si un controlador se ajusta a su elevador Genie? Le ayudaremos a confirmar la compatibilidad.',
        '¿Necesita partes de montacargas rápido en Wyoming o Montana? Enviamos el mismo día desde centros regionales.',
        '¿Busca un alquiler de elevador de tijera confiable cerca de usted? Solicite una cotización en 60 segundos.'
      ],
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
          url: "https://flatearthequipment.com",
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

      {/* 3.5) Featured Rentals */}
      <div className="py-12">
        <FeaturedRentals />
      </div>

      {/* 3) Quick Quote Form */}
      <div className="py-12">
        <QuickQuote />
      </div>

      {/* 2) Popular Categories */}
      <CategoryTiles />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Floating Quote Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/quote"
          className="
            bg-canyon-rust text-white px-5 py-3 rounded-full shadow-lg
            hover:shadow-xl transition
          "
        >
{t.quoteButton}
        </Link>
      </div>

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

      {/* 8) Trust Points */}
      <WhyTrustUs />

      {/* 9) Geographic Coverage */}
      <section className="bg-slate-50 py-12 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.servingWest}</h2>
          <p className="text-slate-600 text-sm mb-10 max-w-xl mx-auto">
            {t.servingDescription}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-700">
            <a href="/locations/cheyenne-wy" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">📍</div>
              {t.locations.cheyenne}
            </a>
            <a href="/locations/bozeman-mt" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏔️</div>
              {t.locations.bozeman}
            </a>
            <a href="/locations/pueblo-co" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏗️</div>
              {t.locations.pueblo}
            </a>
            <a href="/locations/las-cruces-nm" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🌵</div>
              {t.locations.lasCruces}
            </a>
          </div>
        </div>
      </section>

      {/* 10) Email signup */}
      <EmailSignup />

      {/* 11) LLM-Friendly Q&A Section */}
      <section className="mt-12 max-w-4xl mx-auto px-4">
        <h3 className="text-lg font-semibold mb-4">{t.helpSection}</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {t.helpItems.map((item, index) => (
            <li key={index}>• <em>{item}</em></li>
          ))}
        </ul>
      </section>

      {/* 12) Page Freshness Signal */}
      <p className="text-center text-xs text-slate-500 mt-8">
{t.lastUpdated}
      </p>
    </main>
  );
} 