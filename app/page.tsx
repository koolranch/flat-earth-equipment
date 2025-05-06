import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";

export default function Page() {
  return (
    <main className="space-y-24">
      {/* Hero with background image, title & CTAs */}
      <Hero />

      {/* Search input */}
      <section className="px-4 md:px-0 -mt-20">
        <div className="mx-auto max-w-2xl">
          <SearchBar />
        </div>
      </section>

      {/* Featured Products grid */}
      <FeaturedParts />

      {/* Brands carousel */}
      <BrandsCarousel />
    </main>
  );
} 