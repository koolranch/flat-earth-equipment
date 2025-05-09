import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const generateStaticParams = async () => {
  const { data: cats, error } = await supabase
    .from("rental_equipment")
    .select("category");
  if (error || !cats) return [];
  const categoriesList = cats.map((c) => c.category);
  const uniqueCategories = categoriesList.filter((cat, idx, arr) => arr.indexOf(cat) === idx);
  return uniqueCategories.map((category) => ({ slug: category.toLowerCase().replace(/\s+/g, "-") }));
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const formattedCategory = params.slug.replace(/-/g, " ");
  return {
    title: `${formattedCategory} Rentals | Flat Earth Equipment`,
    description: `Find rental listings for ${formattedCategory} equipment.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const formattedCategory = params.slug.replace(/-/g, " ");
  const { data: equipment, error } = await supabase
    .from("rental_equipment")
    .select("*")
    .ilike("category", `%${formattedCategory}%`);

  if (error || !equipment) {
    return <p className="p-8 text-red-600">Error: {error?.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">
        {formattedCategory} Rentals
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="block rounded-lg border p-6 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            {item.brand && (
              <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
            )}
            {item.price && (
              <p className="text-lg font-medium text-canyon-rust">
                ${item.price.toFixed(2)}/day
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
} 