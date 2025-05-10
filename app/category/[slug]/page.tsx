import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

export default function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
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

      {category.supportedBrandSlugs && category.supportedBrandSlugs.length > 0 && (
        <section className="mt-16 mb-12">
          <h2 className="text-xl font-semibold mb-4">Supported Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {category.supportedBrandSlugs.map((brandSlug) => {
              const brand = brands.find((b) => b.slug === brandSlug);
              if (!brand) return null;

              // Normalize slug: lowercase, spaces & underscores → hyphens
              const normalizedSlug = brand.slug.toLowerCase().replace(/[\s_]+/g, "-");

              // Use .png for these brands, otherwise .webp
              const pngBrands = ["enersys", "liugong"];
              const ext = pngBrands.includes(normalizedSlug) ? "png" : "webp";

              // Build path & get public URL
              const { data: { publicUrl: logoUrl } } = supabase
                .storage
                .from("brand-logos")
                .getPublicUrl(`${normalizedSlug}.${ext}`);

              return (
                <Link
                  key={brand.slug}
                  href={`/brand/${brand.slug}`}
                  className="text-center group"
                >
                  <img
                    src={logoUrl}
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
            {category.relatedSlugs.map((relatedSlug) => {
              const related = categories.find((c) => c.slug === relatedSlug);
              if (!related) return null;
              
              return (
                <li key={relatedSlug}>
                  <Link 
                    href={`/parts-category/${related.slug}`} 
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