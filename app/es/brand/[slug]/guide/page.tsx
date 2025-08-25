import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Marca no encontrada' };
  
  return { 
    title: `${brand.name} — Guía de servicio y números de serie | Flat Earth Equipment`, 
    description: `Guía completa de servicio de ${brand.name} que cubre ubicaciones de placas de serie, consejos de resolución de problemas y procedimientos de mantenimiento para tu equipo.`,
    alternates: { 
      languages: { 
        'en-US': `/brand/${params.slug}/guide`, 
        'es-US': `/es/brand/${params.slug}/guide` 
      } 
    } 
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <div className="space-y-8">
        {/* Brand Guide Section */}
        <BrandGuideBlock slug={brand.slug} name={brand.name} />

        {/* Brand FAQ Section */}
        <BrandFAQBlock slug={brand.slug} name={brand.name} url={`https://www.flatearthequipment.com/es/brand/${brand.slug}/guide`} />
      </div>
    </>
  );
}
