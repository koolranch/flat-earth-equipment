import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { createClient } from "@supabase/supabase-js";
import Script from "next/script";

export default function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      {/* JSON-LD Structured Data */}
      <Script id="itemlist-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "url": `https://flatearthequipment.com/category/${slug}#item1` },
            { "@type": "ListItem", "position": 2, "url": `https://flatearthequipment.com/category/${slug}#item2` }
          ]
        })}
      </Script>

      <h1 className="text-3xl font-bold text-slate-900 mb-4">{category.name}</h1>
      
      <section className="mb-12">
        <p className="text-lg text-slate-600 max-w-3xl">
          {category.intro}
        </p>
      </section>

      {/* Compatible Brands Section */}
      <section className="mb-12 bg-slate-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Compatible Brands</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brands.slice(0, 5).map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}?category=${slug}`}
              className="group flex items-center p-3 bg-white rounded-md border border-slate-200 hover:border-canyon-rust transition-colors"
              aria-label={`View ${brand.name} ${category.name.toLowerCase()}`}
            >
              <span className="text-slate-800 group-hover:text-canyon-rust transition-colors">
                View {brand.name} {category.name.toLowerCase()}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CategoryProductGrid categorySlug={slug} />
    </main>
  );
} 