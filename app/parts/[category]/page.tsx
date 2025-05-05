import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export const generateStaticParams = async () => {
  const { data: cats } = await supabase
    .from('parts')
    .select('category');
  if (!cats) return [];
  const distinctCategories = Array.from(new Set(cats.map((c) => c.category)));
  return distinctCategories.map((category) => ({ category }));
};

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const { category } = params;
  return {
    title: `${category} Parts | Flat Earth Equipment`,
    description: `Browse ${category} parts by system.`,
    alternates: { canonical: `/parts/${category}` },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const { data: parts, error } = await supabase
    .from('parts')
    .select('slug,name,price')
    .eq('category', category)
    .order('name');

  if (error) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{category} Parts</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parts?.map((part) => (
          <Link
            key={part.slug}
            href={`/parts/${category}/${part.slug}`}
            className="block rounded-xl border p-4 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{part.name}</h2>
            <p className="mt-2 text-lg">${part.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 