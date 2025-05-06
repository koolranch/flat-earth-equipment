import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center gap-6 min-h-screen text-center bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 w-full max-w-2xl bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-6">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl text-white">
          Flat Earth Equipment
        </h1>
        <p className="max-w-lg text-base text-gray-200">
          OEM replacement parts & nationwide equipment rentals—fast quotes, same‑day shipping.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/parts"
            className="btn-primary shadow-lg transform transition hover:-translate-y-1 hover:shadow-2xl"
          >
            Find Parts
          </Link>
          <Link
            href="/rentals"
            className="btn-secondary shadow-lg transform transition hover:-translate-y-1 hover:shadow-2xl"
          >
            Rent Equipment
          </Link>
        </div>
        <div className="mt-4 w-full max-w-lg">
          <SearchBar />
        </div>
      </div>
    </section>
  );
} 