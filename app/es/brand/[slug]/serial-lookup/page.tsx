import BrandTabs from '@/components/brand/BrandTabs';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import SerialLookupEmbed from '@/components/brand/SerialLookupEmbed';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Marca no encontrada' };
  
  return { 
    title: `${brand.name} — Búsqueda por número de serie | Flat Earth Equipment`, 
    description: `Encuentra la ubicación del número de serie de tu equipo ${brand.name} y decodifica tu serie para identificación de partes e historial de servicio.`,
    alternates: { 
      languages: { 
        'en-US': `/brand/${params.slug}/serial-lookup`, 
        'es-US': `/es/brand/${params.slug}/serial-lookup` 
      } 
    } 
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const url = `https://www.flatearthequipment.com/es/brand/${brand.slug}/serial-lookup`;
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <SerialToolJsonLd brand={brand} url={url} />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <BrandTabs slug={brand.slug} />
          
          {/* Serial Lookup Content */}
          <div className="space-y-6">
            <SerialLookupEmbed brandSlug={brand.slug} brandName={brand.name} />
          </div>

          {/* Brand FAQ Section */}
          <BrandFAQBlock slug={brand.slug} name={brand.name} url={url} />

          {/* Parts Request Section with Anchor */}
          <BrandPartsFormSection>
            <PartsLeadForm brandSlug={brand.slug} brandName={brand.name} />
          </BrandPartsFormSection>
        </div>
      </main>
    </>
  );
}
