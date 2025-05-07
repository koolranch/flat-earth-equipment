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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-2xl px-4">
        <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-4">
          Flat Earth Equipment
        </h1>
        <p className="text-lg text-brand-light mb-8">
          OEM Parts & Nationwide Rentals—Fast Quotes, Same-Day Shipping.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link
            href="/parts"
            className="btn px-6 py-3 bg-brand text-white font-medium rounded-lg shadow-card hover:bg-brand-dark transition"
          >
            Find Parts
          </Link>
          <Link
            href="/rentals"
            className="btn px-6 py-3 border-2 border-brand text-brand font-medium rounded-lg shadow-card hover:bg-brand-light transition"
          >
            Rent Equipment
          </Link>
        </div>
        {/* consolidated shared search component */}
        <div className="mt-8 w-full max-w-md mx-auto">
          <SearchBar />
        </div>
      </div>
    </header>
  );
} 