import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-6 min-h-screen text-center bg-gradient-to-b from-blue-600 to-blue-800"
    >
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Flat Earth Equipment
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
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
    </section>
  );
} 