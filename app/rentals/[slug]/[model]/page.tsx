import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string; model: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const modelName = params.model.replace(/-/g, " ");
  const categoryName = params.slug.replace(/-/g, " ");
  return {
    title: `${modelName} Rental | Flat Earth Equipment`,
    description: `Rent the ${modelName} from our ${categoryName} fleet. View specs & request a quote.`,
    alternates: { canonical: `/rentals/${params.slug}/${params.model}` },
  };
}

async function fetchModel(category: string, modelSlug: string) {
  const formattedCategory = category.replace(/-/g, " ");
  const formattedModel = modelSlug.replace(/-/g, " ");
  const { data, error } = await supabase
    .from("rental_equipment")
    .select("*")
    .ilike("category", `%${formattedCategory}%`)
    .ilike("name", `%${formattedModel}%`)
    .single();

  if (error) {
    console.error("Error fetching model:", error);
    notFound();
  }
  return data;
}

export default async function ModelDetailPage({ params }: Props) {
  const model = await fetchModel(params.slug, params.model);
  const brandSlug = model.brand.toLowerCase().replace(/\s+/g, '-');
  const { data: { publicUrl: logoUrl } } = supabase
    .storage
    .from('brand-logos')
    .getPublicUrl(`${brandSlug}.webp`);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center mb-4">
        <Image
          src={logoUrl}
          alt={`${model.brand} logo`}
          width={100}
          height={100}
          className="inline-block mr-3 align-middle"
        />
        <h1 className="text-3xl font-bold">{model.brand} {model.name}</h1>
      </div>
      {/* If you have images, swap src to model.image */}
      <div className="mb-6">
        <img
          src={`/images/rentals/${params.slug}/${params.model}.jpg`}
          alt={`${model.brand} ${model.name}`}
          className="w-full rounded-xl shadow"
        />
      </div>
      <ul className="mb-6 list-disc list-inside text-gray-700">
        {model.lift_height_ft && <li>Lift Height: {model.lift_height_ft} ft</li>}
        {model.weight_capacity_lbs && <li>Capacity: {model.weight_capacity_lbs} lbs</li>}
        {model.power_source && <li>Power Source: {model.power_source}</li>}
      </ul>
      <p className="mb-8 text-gray-800">{model.notes}</p>
      <Link
        href={`/quote?model=${encodeURIComponent(model.name)}`}
        className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
      >
        Request a Quote
      </Link>
    </main>
  );
} 