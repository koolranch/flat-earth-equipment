import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";

export function Hero() {
  return (
    <section
      className="relative bg-cover bg-center text-white py-24 text-center"
      style={{ backgroundImage: "url('/site-assets/hero-bg-mountains.webp')" }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold font-heading tracking-tight">
          Flat Earth Equipment
        </h1>
        <p className="mt-6 text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
          OEM replacement parts & equipment rentals — fast quotes, same-day shipping across WY, MT, & NM.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <SearchBar />
          <div className="flex gap-4">
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              <a href="/parts">Browse Parts</a>
            </Button>
            <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
              <a href="/rentals">Rent Equipment</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 