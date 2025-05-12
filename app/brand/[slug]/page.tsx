import { Metadata } from 'next';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/server';

interface Brand {
  name: string;
  slug: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: brand } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', params.slug)
    .single();

  if (!brand) {
    return {
      title: 'Brand Not Found | Flat Earth Equipment',
      description: 'The requested brand could not be found.',
    };
  }

  return {
    title: `${brand.name} Parts | Flat Earth Equipment`,
    description: `High-quality aftermarket parts for ${brand.name} equipment.`,
    alternates: { canonical: `/brand/${params.slug}` }
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  
  // ... existing code ...

  return (
    <main>
      <h1>{brand?.name} Parts</h1>
      // ... existing code ...
    </main>
  );
} 