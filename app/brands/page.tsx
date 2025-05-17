import { brands } from "@/lib/data/brands";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Shop by Brand | Flat Earth Equipment",
  description:
    "Explore parts by top equipment brands like Genie, Doosan, Caterpillar, and more. 40+ supported brands with fast quotes and same-day shipping.",
};

export default async function BrandsPage() {
  const supabase = createClient();

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
        Browse Parts by Brand
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {brands.map((brand) => {
          // Normalize slug: lowercase, spaces & underscores → hyphens
          const brandSlug = brand.slug.toLowerCase().replace(/[\s_]+/g, "-");

          // Use .png for these brands, otherwise .webp
          const pngBrands = ["enersys", "liugong"];
          const ext = pngBrands.includes(brandSlug) ? "png" : "webp";

          // Build path & get public URL
          const { data: { publicUrl: logoUrl } } = supabase
            .storage
            .from("brand-logos")
            .getPublicUrl(`${brandSlug}.${ext}`);

          return (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="text-center group"
            >
              <img
                src={logoUrl}
                alt={`${brand.name} logo`}
                className="h-12 mx-auto object-contain group-hover:opacity-80"
              />
              <p className="text-sm text-slate-600 mt-2 group-hover:text-canyon-rust">
                {brand.name}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        <strong>Not an Authorized Dealer.</strong> Flat Earth Equipment partners with trusted suppliers to deliver OEM-spec and remanufactured parts—fully warrantied and ready to ship.
      </p>

      <p className="mt-12 text-center text-slate-500 text-sm">
        Don't see your brand?{" "}
        <Link href="/contact" className="text-canyon-rust underline">
          Request it here
        </Link>
        .
      </p>
    </main>
  );
} 