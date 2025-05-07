import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";

export default function Page() {
  return (
    <main className="space-y-24">
      {/* Hero with placeholder background */}
      <Hero />

      {/* Search input overlapping hero */}
      <section className="-mt-20 px-4 md:px-0">
        <div className="mx-auto max-w-2xl">
          <SearchBar />
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedParts />

      {/* Brands Carousel */}
      <BrandsCarousel />
    </main>
  );
} 