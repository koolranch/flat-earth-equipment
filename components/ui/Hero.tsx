import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <img
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt="Western mountain range background representing rugged industrial service region"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

      {/* Text Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Parts & Rentals, Western Tough
          </h1>
          <p className="text-white text-base md:text-lg mb-6">
            Precision-fit components and dispatch-ready equipment — fast quotes, same-day shipping, and no runaround.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="w-full sm:w-auto">
              <SearchBar />
            </div>
            <Link
              href="/quote"
              className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-700 transition"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 