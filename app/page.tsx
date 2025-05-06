import { Metadata } from "next";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
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
      <Hero />
      <SearchBar />
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
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Why Shop With Us</h2>
          <div className="mx-auto max-w-4xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { file: "fast-shipping.svg", title: "Fast Shipping" },
              { file: "oem-quality.svg", title: "OEM Quality" },
              { file: "support.svg", title: "24/7 Support" },
              { file: "guarantee.svg", title: "Satisfaction Guarantee" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <img
                  src={`/icons/${item.file}`}
                  alt={item.title}
                  className="h-12 w-12 mb-4"
                  loading="lazy"
                />
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
            ))}
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