import { Metadata } from "next";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import FeaturedParts from "@/components/FeaturedParts";
import BrandsCarousel from "@/components/BrandsCarousel";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Flat Earth Equipment | Parts & Rentals",
  description: "OEM replacement parts and nationwide equipment rentals. Same‑day shipping on charger modules, controllers, hydraulics, and more.",
  alternates: { canonical: "https://flat-earth-equipment.vercel.app/" },
  other: { "og:type": "website" },
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4">
      {/* Phase 1: Hero */}
      <Hero />
      {/* Phase 1: Search in Hero */}
      <SearchBar />
      {/* Phase 2: Featured products */}
      <FeaturedParts />
      {/* Featured Categories */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Equipment Category</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Forklift",
              "Excavator",
              "Skid Steer",
              "Loader",
              "Charger Modules",
            ].map((cat) => (
              <Link
                key={cat}
                href={`/parts/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative block overflow-hidden rounded-lg shadow hover:shadow-xl transition"
              >
                <img
                  src={`https://via.placeholder.com/300x200.png?text=${cat.toLowerCase().replace(/ /g, "-")}`}
                  alt={cat}
                  className="h-40 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition">
                  <span className="text-white opacity-0 hover:opacity-100">View {cat}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <div className="flex flex-col items-center space-y-2">
            <img
              src="https://unpkg.com/heroicons@2.0.18/24/solid/truck.svg"
              alt="Fast Shipping"
              className="h-10 w-10"
              loading="lazy"
            />
            <h3 className="text-lg font-medium">Fast Shipping</h3>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <img
              src="https://unpkg.com/heroicons@2.0.18/24/solid/wrench.svg"
              alt="OEM Quality"
              className="h-10 w-10"
              loading="lazy"
            />
            <h3 className="text-lg font-medium">OEM Quality</h3>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <img
              src="https://unpkg.com/heroicons@2.0.18/24/solid/chat-bubble-oval-left.svg"
              alt="24/7 Support"
              className="h-10 w-10"
              loading="lazy"
            />
            <h3 className="text-lg font-medium">24/7 Support</h3>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <img
              src="https://unpkg.com/heroicons@2.0.18/24/solid/badge-check.svg"
              alt="Satisfaction Guarantee"
              className="h-10 w-10"
              loading="lazy"
            />
            <h3 className="text-lg font-medium">Satisfaction Guarantee</h3>
          </div>
        </div>
      </section>
      <BrandsCarousel />
      <section className="mt-16 grid gap-6 sm:grid-cols-2">
        <Link href="/parts" className="tile">Browse Parts →</Link>
        <Link href="/rentals" className="tile">Browse Rentals →</Link>
      </section>
      <Footer />
    </main>
  );
} 