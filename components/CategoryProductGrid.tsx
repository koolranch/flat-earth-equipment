import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

type CategoryProductGridProps = {
  categorySlug: string;
};

export default async function CategoryProductGrid({ categorySlug }: CategoryProductGridProps) {
  try {
    const supabase = createClient();

    // Convert slug to category name format
    const formattedCategory = categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    console.log('Fetching parts for category:', formattedCategory);
    
    const { data: parts, error } = await supabase
      .from("parts")
      .select("*")
      .ilike("category", `%${formattedCategory}%`);

    if (error) {
      console.error("Supabase error:", error);
      return (
        <section className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Parts in This Category</h2>
          <p className="text-red-600">Failed to load parts. Please try again later.</p>
        </section>
      );
    }

    if (!parts || parts.length === 0) {
      return (
        <section className="mt-12 text-center text-slate-600">
          <h2 className="text-xl font-semibold mb-4">Parts in This Category</h2>
          <p>No parts are currently listed for this category. Check back soon or <Link href="/contact" className="text-canyon-rust underline">request a quote</Link>.</p>
        </section>
      );
    }

    return (
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Parts in This Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {parts.map((part) => (
            <Link
              key={part.id}
              href={`/parts/${part.slug}`}
              className="bg-white border border-slate-200 rounded-md p-4 shadow-sm text-center hover:border-canyon-rust transition-colors"
            >
              <div className="relative h-24 bg-slate-100 rounded mb-4">
                {part.image_url ? (
                  <Image
                    src={part.image_url}
                    alt={part.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-slate-400 text-xs">Image coming soon</span>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800 mb-1">{part.name}</p>
              {part.brand && (
                <p className="text-xs text-slate-500 mb-1">{part.brand}</p>
              )}
              {part.price && (
                <p className="text-sm text-slate-700 mt-1">${part.price.toFixed(2)}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error in CategoryProductGrid:', error);
    return (
      <section className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Parts in This Category</h2>
        <p className="text-red-600">An unexpected error occurred. Please try again later.</p>
      </section>
    );
  }
} 