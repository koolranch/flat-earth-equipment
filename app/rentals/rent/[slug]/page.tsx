import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

interface RentalModel {
  id: string;
  brand: string;
  model: string;
  lift_height_ft?: number;
  weight_capacity_lbs?: number;
  power_source: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryTitle = params.slug.replace(/-/g, " ");
  return {
    title: `${categoryTitle} Rentals | Flat Earth Equipment`,
    description: `Rent ${categoryTitle} equipment nationwide. Top brands, reliable machines, and fast availability.`,
    alternates: { canonical: `/rent/${params.slug}` },
  };
}

async function fetchModelsByCategory(slug: string) {
  const formattedCategory = slug.replace(/-/g, " ");
  const { data, error } = await supabase
    .from("rental_equipment")
    .select("*")
    .ilike("category", `%${formattedCategory}%`)
    .order("brand", { ascending: true });

  if (error) throw error;
  return data as RentalModel[];
}

export default async function RentalCategoryPage({ params }: Props) {
  const models = await fetchModelsByCategory(params.slug);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 capitalize">
        {params.slug.replace(/-/g, " ")} Rentals
      </h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model: RentalModel) => (
          <div key={model.id} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold">
              {model.brand} {model.model}
            </h2>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {model.lift_height_ft && (
                <li>Lift Height: {model.lift_height_ft} ft</li>
              )}
              {model.weight_capacity_lbs && (
                <li>Capacity: {model.weight_capacity_lbs} lbs</li>
              )}
              <li>Power Source: {model.power_source}</li>
            </ul>
            <Link
              href={`/quote?model=${encodeURIComponent(model.model)}`}
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              Request Quote
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
} 