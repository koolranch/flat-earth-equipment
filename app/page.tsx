import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";

export default function Page() {
  return (
    <main className="space-y-24">
      {/* Hero with placeholder background */}
      <Hero />

      {/* Featured Products */}
      <FeaturedParts />

      {/* Brands Carousel */}
      <BrandsCarousel />
    </main>
  );
} 