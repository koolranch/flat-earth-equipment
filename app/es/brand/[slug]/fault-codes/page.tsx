import BrandHubPage from '@/components/brand/BrandHubPage';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Marca no encontrada' };
  
  return { 
    title: `${brand.name} — Códigos de falla y diagnóstico | Flat Earth Equipment`, 
    description: `Busca códigos de error y códigos de diagnóstico de ${brand.name} con soluciones, causas y pasos de resolución para tu equipo.`,
    alternates: { 
      languages: { 
        'en-US': `/brand/${params.slug}/fault-codes`, 
        'es-US': `/es/brand/${params.slug}/fault-codes` 
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
      <BrandHubPage brand={brand} defaultTab="fault-codes" />
    </>
  );
}
