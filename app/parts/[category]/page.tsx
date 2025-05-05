import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import CategoryParts from "../../../components/CategoryParts";

export const generateStaticParams = async () => {
  const { data: cats } = await supabase
    .from("parts")
    .select("category")
    .order("category");
  return cats?.map((c) => ({ category: c.category })) || [];
};

export async function generateMetadata({ params: { category } }: { params: { category: string } }): Promise<Metadata> {
  return {
    title: `${category} Parts | Flat Earth Equipment`,
    description: `Browse ${category} parts by system.`,
    alternates: { canonical: `/parts/${category}` },
  };
}

export default async function CategoryPage({ params: { category } }: any) {
  // fetch distinct systems for this category
  const { data: systems } = await supabase
    .from("parts")
    .select("system", { distinct: true } as any)
    .eq("category", category)
    .order("system");

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{category} Parts</h1>
      <CategoryParts category={category} systems={systems || []} />
    </main>
  );
} 