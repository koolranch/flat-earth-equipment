import Link from "next/link";

const brands = ["bobcat","cat","john-deere","toyota","yale"];
export default function BrandsCarousel() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <div className="container mx-auto flex justify-between items-center space-x-4 overflow-x-auto">
        {brands.map((b) => (
          <Link key={b} href={`/parts/${b}`} className="flex-shrink-0">
            <div className="h-16 w-32 bg-gray-200 rounded-lg" aria-label={b} />
          </Link>
        ))}
      </div>
    </section>
  );
} 