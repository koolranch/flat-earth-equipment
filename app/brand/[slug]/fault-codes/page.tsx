import { resolveCanonical } from '@/lib/brandCanon';
import BrandHubPage from '@/components/brand/BrandHubPage';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Brand Not Found' };
  
  const canonical = resolveCanonical(params.slug, 'fault-codes');
  return { 
    title: `${brand.name} Fault Codes & Diagnostics | Flat Earth Equipment`, 
    description: `Search ${brand.name} error codes and diagnostic trouble codes with solutions, causes, and troubleshooting steps for your equipment.`,
    alternates: { canonical } 
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  return (
    <div>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <BrandHubPage brand={brand} defaultTab="fault-codes" />
    </div>
  );
}
