import { resolveCanonical } from '@/lib/brandCanon';
import BrandTabs from '@/components/brand/BrandTabs';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import FaultSearch from '@/components/faults/FaultSearch';
import CommonFaultCodesTable from '@/components/faults/CommonFaultCodesTable';
import FaultLikelyParts from '@/components/faults/FaultLikelyParts';
import RelatedFaultGuides from '@/components/faults/RelatedFaultGuides';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import RecentCommunityNotes from '@/components/brand/RecentCommunityNotes';
import SubmissionFormV2 from '@/components/brand/SubmissionFormV2';
import { getBrand } from '@/lib/brands';
import { JCB_COMMON_FAULT_CODES, JCB_CODE_RETRIEVAL_STEPS } from '@/lib/faults/jcbCommonCodes';
import { getJcbFaultLikelyParts } from '@/lib/faults/getBrandFaultParts';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Marca no encontrada' };
  
  const canonicalEn = resolveCanonical(params.slug, 'fault-codes');
  const fullUrlEn = `https://www.flatearthequipment.com${canonicalEn}`;
  const fullUrlEs = `https://www.flatearthequipment.com/es/brand/${params.slug}/fault-codes`;
  
  return { 
    title: `${brand.name} — Códigos de falla y diagnóstico | Flat Earth Equipment`, 
    description: `Busca códigos de error y códigos de diagnóstico de ${brand.name} con soluciones, causas y pasos de resolución para tu equipo.`,
    alternates: { 
      canonical: fullUrlEs, // Spanish page's canonical should be itself
      languages: { 
        'en-US': fullUrlEn, 
        'es-US': fullUrlEs,
        'x-default': fullUrlEn
      } 
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  };
}

export default async function Page({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const canonicalUrl = `https://www.flatearthequipment.com/es/brand/${brand.slug}/fault-codes`;
  const isJcb = brand.slug === 'jcb';
  const jcbPartsGroups = isJcb ? await getJcbFaultLikelyParts(3) : [];
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <BrandTabs slug={brand.slug} />
          
          <div className="space-y-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Códigos de Falla y Diagnóstico de {brand.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Busca nuestra base de datos de códigos de falla comunes de {brand.name} y orientación de diagnóstico. 
                Úsalos como punto de partida — siempre confirma con los procedimientos de servicio oficiales.
              </p>
            </div>
            <FaultSearch brand={brand.slug} />
          </div>

          {isJcb ? (
            <>
              <section className="mt-8 rounded-xl border bg-white p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Cómo leer códigos JCB</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{JCB_CODE_RETRIEVAL_STEPS}</p>
              </section>
              <CommonFaultCodesTable brandName={brand.name} codes={JCB_COMMON_FAULT_CODES} />
              <FaultLikelyParts
                brandName={brand.name}
                groups={jcbPartsGroups}
                browseAllHref="/parts?brand=JCB"
              />
              <RelatedFaultGuides />
              <BrandFAQBlock
                slug={brand.slug}
                name={brand.name}
                url={canonicalUrl}
                faqKey="jcb-faults"
                heading="Preguntas frecuentes sobre códigos JCB"
              />
            </>
          ) : (
            <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonicalUrl} />
          )}

          {svcEnabled && (
            <div className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <RecentCommunityNotes brandSlug={brand.slug} />
                </div>
                <div>
                  <SubmissionFormV2 brand={brand} />
                </div>
              </div>
            </div>
          )}

          <BrandPartsFormSection>
            <PartsLeadForm brandSlug={brand.slug} brandName={brand.name} />
          </BrandPartsFormSection>
        </div>
      </main>
    </>
  );
}
