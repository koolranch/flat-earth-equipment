import Link from "next/link";

const categories = [
  { slug: "forklift", label: "Forklifts" },
  { slug: "excavator", label: "Excavators" },
  { slug: "skid-steer", label: "Skid Steers" },
  { slug: "charger-modules", label: "Charger Modules" },
  { slug: "loader", label: "Loaders" },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Equipment</h2>
      <div className="container mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:shadow-lg"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-full" aria-hidden="true" />
            <span className="font-medium text-center">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
} 