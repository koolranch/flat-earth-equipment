import { Hero } from "@/components/ui/Hero";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarouselClient";

// List of brand image files
const brandFiles = [
  "honda.png",
  "yamaha.png",
  "kawasaki.png",
  "suzuki.png",
  "ktm.png",
  "husqvarna.png"
];

export default function Page() {
  return (
    <main className="space-y-24">
      {/* 1) Full-bleed Hero */}
      <Hero />

      {/* 2) Featured Products grid */}
      <FeaturedParts />

      {/* 3) Brands carousel */}
      <BrandsCarousel files={brandFiles} />
    </main>
  );
} 