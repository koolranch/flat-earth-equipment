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
  return uniqueCategories.map((category) => ({ category }));
};

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category.replace(/-/g, " ")} Rentals | Flat Earth Equipment`,
    description: `Find rental listings for ${category.replace(/-/g, " ")} in your city.`,
  };
}

export default async function CategoryPage({ params }: any) {
  const { category } = await params;
  const { data: cities, error } = await supabase
    .from("rental_equipment")
    .select("city")
    .eq("category", category);

  if (error || !cities) {
    return <p className="p-8 text-red-600">Error: {error?.message}</p>;
  }

  const citiesList = cities.map((c) => c.city);
  const uniqueCities = citiesList.filter((city, idx, arr) => arr.indexOf(city) === idx);

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">
        {category.replace(/-/g, " ")} Rentals
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {uniqueCities.map((city) => (
          <Link
            key={city}
            href={`/rentals/${category}/${city}`}
            className="block rounded-lg border p-6 text-center hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{city.replace(/-/g, " ")}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
} 