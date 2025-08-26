import BrandTabs from '@/components/brand/BrandTabs';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import FaultSearch from '@/components/faults/FaultSearch';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import SubmissionForm from '@/components/brand/SubmissionForm';
import CommunityNotes from '@/components/brand/CommunityNotes';
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
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const canonicalUrl = `https://www.flatearthequipment.com/es/brand/${brand.slug}/fault-codes`;
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <BrandTabs slug={brand.slug} />
          
          {/* Fault Codes Content */}
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Base de Datos de Códigos de Falla de {brand.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Busca nuestra base de datos de códigos de falla comunes de {brand.name} y orientación de diagnóstico. 
                Úsalos como punto de partida - siempre confirma con los procedimientos de servicio oficiales.
              </p>
            </div>
            <FaultSearch brand={brand.slug} />
          </div>

          {/* Brand FAQ Section */}
          <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonicalUrl} />

          {/* UGC Sections - Only on Fault Codes Tab */}
          {svcEnabled && (
            <>
              <SubmissionForm brand={brand} />
              <CommunityNotes brandSlug={brand.slug} category='fault' />
            </>
          )}

          {/* Parts Request Section with Anchor */}
          <BrandPartsFormSection>
            <PartsLeadForm brandSlug={brand.slug} brandName={brand.name} />
          </BrandPartsFormSection>
        </div>
      </main>
    </>
  );
}
