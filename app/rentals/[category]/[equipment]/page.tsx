import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Props {
  params: { category: string; equipment: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const equipmentName = params.equipment.replace(/-/g, " ");
  const categoryName = params.category.replace(/-/g, " ");
  return {
    title: `${equipmentName} Rental | Flat Earth Equipment`,
    description: `Rent the ${equipmentName} from our ${categoryName} fleet. View specs & request a quote.`,
    alternates: { canonical: `/rentals/${params.category}/${params.equipment}` },
  };
}

async function fetchEquipment(category: string, equipmentSlug: string) {
  const formattedCategory = category.replace(/-/g, " ");
  const formattedEquipment = equipmentSlug.replace(/-/g, " ");
  const { data, error } = await supabase
    .from("rental_equipment")
    .select("*")
    .ilike("category", `%${formattedCategory}%`)
    .ilike("name", `%${formattedEquipment}%`)
    .single();

  if (error) {
    console.error("Error fetching equipment:", error);
    notFound();
  }
  return data;
}

export default async function EquipmentDetailPage({ params }: Props) {
  const equipment = await fetchEquipment(params.category, params.equipment);
  const brandSlug = equipment.brand.toLowerCase().replace(/\s+/g, '-');
  const { data: { publicUrl: logoUrl } } = supabase
    .storage
    .from('brand-logos')
    .getPublicUrl(`${brandSlug}.webp`);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center mb-4">
        <Image
          src={logoUrl}
          alt={`${equipment.brand} logo`}
          width={100}
          height={100}
          className="inline-block mr-3 align-middle"
        />
        <h1 className="text-3xl font-bold">{equipment.brand} {equipment.name}</h1>
      </div>
      {/* If you have images, swap src to equipment.image */}
      <div className="mb-6">
        <img
          src={`/images/rentals/${params.category}/${params.equipment}.jpg`}
          alt={`${equipment.brand} ${equipment.name}`}
          className="w-full rounded-xl shadow"
        />
      </div>
      <ul className="mb-6 list-disc list-inside text-gray-700">
        {equipment.lift_height_ft && <li>Lift Height: {equipment.lift_height_ft} ft</li>}
        {equipment.weight_capacity_lbs && <li>Capacity: {equipment.weight_capacity_lbs} lbs</li>}
        {equipment.power_source && <li>Power Source: {equipment.power_source}</li>}
      </ul>
      <p className="mb-8 text-gray-800">{equipment.notes}</p>
      <Link
        href={`/quote?model=${encodeURIComponent(equipment.name)}`}
        className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
      >
        Request a Quote
      </Link>
    </main>
  );
} 