import { resolveCanonical } from '@/lib/brandCanon';
import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Brand Not Found' };
  
  const canonical = resolveCanonical(params.slug, 'guide');
  return { 
    title: `${brand.name} Service & Serial Guide | Flat Earth Equipment`, 
    description: `Complete ${brand.name} service guide covering serial plate locations, troubleshooting tips, and maintenance procedures for your equipment.`,
    alternates: { canonical } 
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  return (
    <div>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <div className="space-y-8">
        {/* Brand Guide Section */}
        <BrandGuideBlock slug={brand.slug} name={brand.name} />

        {/* Brand FAQ Section */}
        <BrandFAQBlock slug={brand.slug} name={brand.name} url={`https://www.flatearthequipment.com/brand/${brand.slug}/guide`} />
      </div>
    </div>
  );
}
