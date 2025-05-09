import supabase from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { getBrandLogoProps } from "@/lib/utils/brand-logos";

type RentalEquipmentGridProps = {
  categorySlug: string;
};

export default async function RentalEquipmentGrid({ categorySlug }: RentalEquipmentGridProps) {
  const formattedCategory = categorySlug.replace(/-/g, " ");
  const { data: equipment, error } = await supabase
    .from("rental_equipment")
    .select("*")
    .ilike("category", `%${formattedCategory}%`);

  if (error) {
    console.error("Supabase error:", error);
    return <p className="text-red-600">Failed to load equipment.</p>;
  }

  if (!equipment || equipment.length === 0) {
    return (
      <section className="mt-12 text-center text-slate-600">
        <h2 className="text-xl font-semibold mb-4">Equipment in This Category</h2>
        <p>No equipment is currently listed for this category. Check back soon or <a href="/contact" className="text-canyon-rust underline">request a quote</a>.</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Equipment in This Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {equipment.map((model) => {
          const brandSlug = model.brand.toLowerCase().replace(/\s+/g, '-');
          
          return (
            <Link
              key={model.id}
              href={`/rentals/${categorySlug}/${model.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition"
            >
              <Image
                {...getBrandLogoProps(brandSlug, model.brand)}
                width={200}
                height={100}
                className="mx-auto mb-4"
              />
              <h2 className="text-lg font-semibold text-center">{model.brand}</h2>
              <p className="mt-2 text-sm text-gray-700 text-center">{model.name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 