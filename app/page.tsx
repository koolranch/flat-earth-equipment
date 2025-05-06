import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import FeaturedParts from "../components/FeaturedParts";
import BrandsCarousel from "../components/BrandsCarousel";

export default function Page() {
  return (
    <>
      {/* Phase 1: Hero */}
      <Hero />

      {/* Phase 1: Search under hero */}
      <div className="relative -mt-16 px-4 sm:px-0">
        <SearchBar />
      </div>

      {/* Phase 2: Featured Products */}
      <FeaturedParts />

      {/* Phase 3: Shop by Brand carousel */}
      <BrandsCarousel />
    </>
  );
} 