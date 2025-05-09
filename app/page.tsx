import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";
import { Features } from "@/components/ui/Features";
import CategoryTiles from "@/components/CategoryTiles";
import EmailSignup from "@/components/EmailSignup";
import QuickQuote from "@/components/QuickQuote";
import Testimonials from "@/components/Testimonials";
import TrustPoints from "@/components/TrustPoints";
import FeaturedRentals from "@/components/FeaturedRentals";

// Define the brand files array
const brandFiles = [
  'Case.webp',
  'Curtis.webp',
  'Genie.webp',
  'JLG.webp',
  'Skyjack.webp',
  'Toyota.webp',
  'Yale.webp'
];

export default function Page() {
  return (
    <main>
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

      {/* 4) Featured Products grid */}
      <section className="py-12">
        <FeaturedParts />
      </section>

      {/* 5) Value-props Features */}
      <section className="py-12 bg-gray-50">
        <Features />
      </section>

      {/* 6) Brands carousel */}
      <section className="py-12">
        <BrandsCarousel />
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
              <div className="text-3xl mb-2">📍</div>
              Cheyenne, WY
            </a>
            <a href="/locations/bozeman-mt" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏔️</div>
              Bozeman, MT
            </a>
            <a href="/locations/pueblo-co" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏗️</div>
              Pueblo, CO
            </a>
            <a href="/locations/las-cruces-nm" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌵</div>
              Las Cruces, NM
            </a>
          </div>
        </div>
      </section>

      {/* 10) Email signup */}
      <EmailSignup />
    </main>
  );
} 