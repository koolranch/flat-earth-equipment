import { redirect } from 'next/navigation';

export default function EsBrandSlugPage({ params }: { params: { slug: string } }) {
  // Always land users on Serial Lookup by default (Spanish version)
  redirect(`/es/brand/${params.slug}/serial-lookup`);
}
