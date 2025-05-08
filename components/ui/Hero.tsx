import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";

export function Hero() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-20"
      style={{
        backgroundImage:
          "url('https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp')",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl font-bold">Flat Earth Equipment</h1>
        <p className="mt-4 text-lg max-w-xl mx-auto">
          OEM replacement parts & equipment rentals — fast quotes, same-day shipping across WY, MT, & NM.
        </p>
        <div className="mt-6 flex justify-center">
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