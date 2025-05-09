import { Metadata } from "next";
import { notFound } from "next/navigation";
import RentalEquipmentGrid from "@/components/RentalEquipmentGrid";

export async function generateStaticParams() {
  // This will be replaced with actual categories from the database
  return [
    { slug: "excavators" },
    { slug: "skid-steers" },
    { slug: "tractors" },
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const formattedCategory = params.slug.replace(/-/g, " ");
  return {
    title: `Rent ${formattedCategory} | Flat Earth Equipment`,
    description: `Rent ${formattedCategory} from Flat Earth Equipment. Browse our selection of high-quality equipment for your next project.`
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Rent {params.slug.replace(/-/g, " ")}
      </h1>
      
      <section className="mb-12">
        <p className="text-lg text-slate-600 max-w-3xl">
          Browse our selection of high-quality {params.slug.replace(/-/g, " ")} available for rent. 
          All equipment is well-maintained and ready for your next project.
        </p>
      </section>

      <RentalEquipmentGrid categorySlug={params.slug} />

      <section className="mt-16 mb-12 bg-slate-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Need a Quote?</h2>
        <p className="text-slate-600 mb-6">
          Can't find what you're looking for? Our team of experts can help you find the right equipment for your needs.
        </p>
        <a
          href="/contact"
          className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
        >
          Request a Quote
        </a>
      </section>
    </main>
  );
} 