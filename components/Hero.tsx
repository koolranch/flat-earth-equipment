import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  return (
    <header className="relative h-[80vh] flex items-center justify-center text-center text-white">
      {/* Hero background */}
      <Image
        src="https://images.unsplash.com/photo-1601134467663-3f30cfb39c4e?auto=format&fit=crop&w=1920&q=80"
        alt="Forklift in Wyoming mountains at sunrise"
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-3xl px-4 mx-auto">
        <h1 className="font-teko text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Parts That Work as Hard as You Do — Western Tough, Nationwide Fast.
        </h1>
        <p className="font-sans text-white/90 text-lg md:text-xl max-w-xl mx-auto mb-8">
          Parts and rentals — same-day quotes, fast dispatch, and rugged gear that's ready to work.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="w-full sm:w-auto">
            <SearchBar />
          </div>
          <Link
            href="/parts"
            className="btn px-8 py-3 bg-brand text-white font-medium rounded-lg shadow-lg hover:bg-brand-dark transition-colors whitespace-nowrap"
          >
            Browse Parts
          </Link>
        </div>
      </div>
    </header>
  );
} 