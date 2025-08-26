import { redirect } from 'next/navigation';

export default function BrandSlugPage({ params }: { params: { slug: string } }) {
  // Always land users on Serial Lookup by default
  // Direct path to avoid any potential canonForBrand loops
  redirect(`/brand/${params.slug}/serial-lookup`);
}