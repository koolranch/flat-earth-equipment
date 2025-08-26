import { redirect } from 'next/navigation';
import { canonForBrand } from '@/lib/brandCanon';

export default function BrandSlugPage({ params }: { params: { slug: string } }) {
  const canon = canonForBrand(params.slug);
  // Always land users on Serial Lookup by default
  redirect(canon.serial);
}