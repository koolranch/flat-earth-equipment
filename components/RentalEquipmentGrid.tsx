import supabase from "@/lib/supabase";

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
        {equipment.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-md p-4 shadow-sm text-center hover:border-canyon-rust transition-colors"
          >
            <div className="h-24 bg-slate-100 rounded mb-4 flex items-center justify-center">
              {/* Placeholder for product image - will be added when we have image support */}
              <span className="text-slate-400 text-xs">Image coming soon</span>
            </div>
            <p className="text-sm font-medium text-slate-800 mb-1">{item.name}</p>
            {item.brand && (
              <p className="text-xs text-slate-500 mb-1">{item.brand}</p>
            )}
            {item.price && (
              <p className="text-sm text-slate-700 mt-1">${item.price.toFixed(2)}/day</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 