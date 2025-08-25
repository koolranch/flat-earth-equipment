import { resolveCanonical } from '@/lib/brandCanon';
import BrandHubPage from '@/components/brand/BrandHubPage';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Brand Not Found' };
  
  const canonical = resolveCanonical(params.slug, 'serial');
  return { 
    title: `${brand.name} Serial Number Lookup | Flat Earth Equipment`, 
    description: `Find your ${brand.name} equipment serial number location and decode your serial for parts identification and service history.`,
    alternates: { canonical } 
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const url = `https://www.flatearthequipment.com/brand/${brand.slug}/serial-lookup`;
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <SerialToolJsonLd brand={brand} url={url} />
      <BrandHubPage brand={brand} defaultTab="serial" />
    </>
  );
}
