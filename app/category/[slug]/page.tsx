import Link from "next/link";
import { Metadata } from "next";

const categories = [
  { slug: "forklift-parts", name: "Forklift Parts" },
  { slug: "skid-steer-parts", name: "Skid Steer Parts" },
  { slug: "telehandler-parts", name: "Telehandler Parts" },
  { slug: "mini-excavator-parts", name: "Mini Excavator Parts" },
  { slug: "buggy-parts", name: "Buggy Parts" },
  { slug: "battery-chargers", name: "Battery Chargers" },
] as const;

type CategorySlug = typeof categories[number]["slug"];

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: CategorySlug } }): Promise<Metadata> {
  const category = categories.find((cat) => cat.slug === params.slug);
  
  if (!category) {
    return {
      title: "Category Not Found | Flat Earth Equipment",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `Buy ${category.name} | Flat Earth Equipment`,
    description: `Explore top-quality ${category.name} with fast quotes and same-day shipping. Built for contractors, fleets, and repair techs across the U.S.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: CategorySlug } }) {
  const category = categories.find((cat) => cat.slug === params.slug);
  
  if (!category) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Category Not Found</h1>
        <p className="text-slate-600">The requested category could not be found.</p>
      </main>
    );
  }

  // Get related categories (excluding current category)
  const relatedCategories = categories
    .filter((cat) => cat.slug !== params.slug)
    .slice(0, 3);

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{category.name}</h1>
      
      <section className="mb-12">
        <p className="text-lg text-slate-600 max-w-3xl">
          Find high-quality replacement parts and components for your {category.name.toLowerCase()}. 
          Our inventory includes OEM and aftermarket options, all backed by our same-day shipping guarantee.
        </p>
      </section>

      <section className="mb-12">
        {/* Placeholder for product grid */}
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-slate-600">Product grid coming soon</p>
        </div>
      </section>

      <section className="mb-12 bg-slate-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Need a Quote?</h2>
        <p className="text-slate-600 mb-6">
          Can't find what you're looking for? Our team of experts can help you source the right parts for your equipment.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
        >
          Request a Quote
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Related Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {relatedCategories.map((relatedCat) => (
            <Link
              key={relatedCat.slug}
              href={`/category/${relatedCat.slug}`}
              className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust transition-colors"
            >
              <h3 className="font-medium text-slate-900">{relatedCat.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
} 