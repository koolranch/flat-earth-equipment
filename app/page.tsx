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
      <section className="bg-slate-50 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Serving the Western U.S.
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Same-day rentals available in Cheyenne, Bozeman, Pueblo, Las Cruces & beyond.
          </p>
          <a
            href="/locations"
            className="inline-block bg-canyon-rust text-white px-6 py-2 rounded-md hover:bg-orange-700 transition text-sm"
          >
            View All Service Areas
          </a>
        </div>
      </section>

      {/* 10) Email signup */}
      <EmailSignup />
    </main>
  );
} 