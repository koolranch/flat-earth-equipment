import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

// Props type including both category and slug parameters
interface PartDetailPageProps {
  params: { category: string; slug: string };
}

// Generate dynamic metadata for the part detail page
export async function generateMetadata({ params }: PartDetailPageProps): Promise<Metadata> {
  const { category, slug } = params;
  const { data: part } = await supabase
    .from('parts')
    .select('name,description')
    .eq('slug', slug)
    .maybeSingle();

  return {
    title: part?.name ? `${part.name} | Flat Earth Equipment` : 'Part Not Found',
    description: part?.description?.slice(0, 160) || '',
    alternates: { canonical: `/parts/${category}/${slug}` },
  };
}

// Render the part detail page
export default async function PartDetail({ params }: PartDetailPageProps) {
  const { category, slug } = params;
  const { data: part, error } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !part) {
    return <p className="p-8 text-red-600">Part not found or error: {error?.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">{part.name}</h1>
      <p className="mt-4 text-lg">${part.price.toFixed(2)}</p>
      <div
        className="mt-6 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: part.description }}
      />
    </main>
  );
} 