import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";
import { Features } from "@/components/ui/Features";
import CategoryTiles from "@/components/CategoryTiles";
import EmailSignup from "@/components/EmailSignup";

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

      {/* 3) Featured Products grid */}
      <section className="py-12">
        <FeaturedParts />
      </section>

      {/* 4) Value-props Features */}
      <section className="py-12 bg-gray-50">
        <Features />
      </section>

      {/* 5) Brands carousel */}
      <section className="py-12">
        <BrandsCarousel files={brandFiles} />
      </section>

      {/* 6) Email signup */}
      <EmailSignup />
    </main>
  );
} 