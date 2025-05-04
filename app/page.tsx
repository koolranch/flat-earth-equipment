import { Metadata } from "next";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flat Earth Equipment | Parts & Rentals",
  description: "OEM replacement parts and nationwide equipment rentals. Same‑day shipping on charger modules, controllers, hydraulics, and more.",
  alternates: { canonical: "https://flat-earth-equipment.vercel.app/" },
  other: { "og:type": "website" },
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4">
      <Hero />
      <SearchBar />
      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        <Link href="/parts" className="tile">Browse Parts →</Link>
        <Link href="/rentals" className="tile">Browse Rentals →</Link>
      </section>
    </main>
  );
} 