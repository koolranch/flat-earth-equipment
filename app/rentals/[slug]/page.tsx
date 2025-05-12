import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const formattedTitle = params.slug.replace(/-/g, ' ');
  return {
    title: `${formattedTitle} Rentals | Flat Earth Equipment`,
    description: `Rent ${formattedTitle} equipment with fast availability and competitive rates.`,
    alternates: { canonical: `/rentals/${params.slug}` },
  };
}

async function fetchModelsByCategory(category: string) {
  try {
    const formatted = category.replace(/-/g, ' ');
    const { data, error } = await supabase
      .from('rental_equipment')
      .select('*')
      .ilike('category', `%${formatted}%`);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching models:', err);
    return [];
  }
}

export default async function RentalCategoryPage({ params }: PageProps) {
  const models = await fetchModelsByCategory(params.slug);
  if (!models.length) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 capitalize">{params.slug.replace(/-/g, ' ')} Rentals</h1>
        <p className="text-lg text-gray-700">No equipment found for this category.</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 capitalize">{params.slug.replace(/-/g, ' ')} Rentals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const equipmentSlug = model.model.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link
              key={model.id}
              href={`/rentals/${params.slug}/${equipmentSlug}`}
              className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">
                {model.brand} {model.model}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {model.lift_height_ft ? `Height: ${model.lift_height_ft} ft • ` : ''}
                {model.weight_capacity_lbs ? `Capacity: ${model.weight_capacity_lbs} lbs • ` : ''}
                Power: {model.power_source}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
} 