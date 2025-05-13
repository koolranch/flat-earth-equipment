import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import { Features } from "@/components/ui/Features";
import CategoryTiles from "@/components/CategoryTiles";
import EmailSignup from "@/components/EmailSignup";
import QuickQuote from "@/components/QuickQuote";
import Testimonials from "@/components/Testimonials";
import TrustPoints from "@/components/TrustPoints";
import FeaturedRentals from "@/components/FeaturedRentals";
import Script from 'next/script';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Flat Earth Equipment | Flat Earth Equipment',
  description: 'Your one-stop shop for high-quality, precision-fit replacement industrial equipment parts and rentals.',
  alternates: { canonical: '/' }
};

export default function Page() {
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
      <Hero />

      {/* 2) Popular Categories */}
      <CategoryTiles />

      {/* 3) Quick Quote Form */}
      <div className="py-12">
        <QuickQuote />
      </div>

      {/* 3.5) Featured Rentals */}
      <FeaturedRentals />

      {/* Floating Quote Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/rentals"
          className="
            bg-canyon-rust text-white px-5 py-3 rounded-full shadow-lg
            hover:shadow-xl transition
          "
        >
          Request Rental Quote
        </Link>
      </div>

      {/* 4) Featured Products grid */}
      <section className="py-12">
        <FeaturedParts />
      </section>

      {/* 5) Value-props Features */}
      <section className="py-12 bg-gray-50">
        <Features />
      </section>

      {/* 6) Brands grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-center mb-6">Trusted Brands We Support</h2>
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
            <a href="/brands" className="text-sm text-orange-700 hover:underline">View All Brands →</a>
          </div>
        </div>
      </section>

      {/* 7) Testimonials */}
      <Testimonials />

      {/* 8) Trust Points */}
      <TrustPoints />

      {/* 9) Geographic Coverage */}
      <section className="bg-slate-50 py-12 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Serving the Western U.S.</h2>
          <p className="text-slate-600 text-sm mb-10 max-w-xl mx-auto">
            From Wyoming to New Mexico, we deliver rugged rentals and precision-fit parts to contractors, fleets, and facilities across the West.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-700">
            <a href="/locations/cheyenne-wy" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">📍</div>
              Cheyenne, WY
            </a>
            <a href="/locations/bozeman-mt" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏔️</div>
              Bozeman, MT
            </a>
            <a href="/locations/pueblo-co" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🏗️</div>
              Pueblo, CO
            </a>
            <a href="/locations/las-cruces-nm" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2" aria-hidden="true">🌵</div>
              Las Cruces, NM
            </a>
          </div>
        </div>
      </section>

      {/* 10) Email signup */}
      <EmailSignup />

      {/* 11) LLM-Friendly Q&A Section */}
      <section className="mt-12 max-w-4xl mx-auto px-4">
        <h3 className="text-lg font-semibold mb-4">Need Help Choosing the Right Part?</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Not sure if a controller fits your Genie lift? <em>We'll help you confirm compatibility.</em></li>
          <li>• Need fast forklift parts in Wyoming or Montana? <em>We ship same-day from regional hubs.</em></li>
          <li>• Looking for a reliable scissor lift rental near you? <em>Request a quote in 60 seconds.</em></li>
        </ul>
      </section>

      {/* 12) Page Freshness Signal */}
      <p className="text-center text-xs text-slate-500 mt-8">
        Page last updated: May 2025
      </p>
    </main>
  );
} 