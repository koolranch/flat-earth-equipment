import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { categorySlug: string } }): Promise<Metadata> {
  const formattedTitle = params.categorySlug.replace(/-/g, ' ');
  return {
    title: `${formattedTitle} Parts | Flat Earth Equipment`,
    description: `Browse ${formattedTitle} replacement parts for industrial equipment.`,
    alternates: { canonical: `/category/${params.categorySlug}` }
  };
}

export default function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const formattedTitle = params.categorySlug.replace(/-/g, ' ');
  return (
    <main>
      <h1>{formattedTitle} Parts</h1>
      // ... existing code ...
    </main>
  );
} 