import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarouselClient";

export default function Page() {
  return (
    <main className="space-y-24">
      {/* 1) Full-bleed Hero */}
      <Hero />

      {/* 2) Featured Products grid */}
      <FeaturedParts />

      {/* 3) Brands carousel */}
      <BrandsCarousel />
    </main>
  );
} 