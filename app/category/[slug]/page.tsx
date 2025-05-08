import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";

type CategorySlug = typeof categories[number]["slug"];

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: CategorySlug } }): Promise<Metadata> {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return {};

  return {
    title: `Buy ${category.name} | Flat Earth Equipment`,
    description: category.intro
  };
}

export default function CategoryPage({ params }: { params: { slug: CategorySlug } }) {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{category.name}</h1>
      
      <section className="mb-12">
        <p className="text-lg text-slate-600 max-w-3xl">
          {category.intro}
        </p>
      </section>

      <section className="mb-12">
        {/* Product grid component will be added in a future phase */}
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-slate-600">Product grid coming soon</p>
        </div>
      </section>

      {category.supportedBrandSlugs && category.supportedBrandSlugs.length > 0 && (
        <section className="mt-16 mb-12">
          <h2 className="text-xl font-semibold mb-4">Supported Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {category.supportedBrandSlugs.map((slug) => {
              const brand = brands.find((b) => b.slug === slug);
              if (!brand) return null;

              return (
                <Link
                  key={brand.slug}
                  href={`/brand/${brand.slug}`}
                  className="text-center group"
                >
                  <img
                    src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.image}`}
                    alt={`${brand.name} logo`}
                    className="h-10 mx-auto object-contain group-hover:opacity-80"
                  />
                  <p className="text-sm text-slate-600 mt-2 group-hover:text-canyon-rust">
                    {brand.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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

      {category.relatedSlugs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mt-12 mb-4">Explore Related Categories</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {category.relatedSlugs.map((slug) => {
              const related = categories.find((c) => c.slug === slug);
              if (!related) return null;
              
              return (
                <li key={slug}>
                  <Link 
                    href={`/category/${related.slug}`} 
                    className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-canyon-rust transition-colors"
                  >
                    <span className="text-slate-900 hover:text-canyon-rust transition-colors">
                      {related.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
} 