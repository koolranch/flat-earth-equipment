import { resolveCanonical } from '@/lib/brandCanon';
import BrandTabs from '@/components/brand/BrandTabs';
import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import RecentCommunityNotes from '@/components/brand/RecentCommunityNotes';
import SubmissionFormV2 from '@/components/brand/SubmissionFormV2';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import { getBrand } from '@/lib/brands';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) return { title: 'Marca no encontrada' };
  
  const canonicalEn = resolveCanonical(params.slug, 'guide');
  const fullUrlEn = `https://www.flatearthequipment.com${canonicalEn}`;
  const fullUrlEs = `https://www.flatearthequipment.com/es/brand/${params.slug}/guide`;
  
  return { 
    title: `${brand.name} — Guía de servicio y números de serie | Flat Earth Equipment`, 
    description: `Guía completa de servicio de ${brand.name} que cubre ubicaciones de placas de serie, consejos de resolución de problemas y procedimientos de mantenimiento para tu equipo.`,
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

export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams?: { notes_limit?: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const canonicalUrl = `https://www.flatearthequipment.com/es/brand/${brand.slug}/guide`;
  
  // Allow larger list via search param (?notes_limit=50) when you want to see more
  const limit = Math.min(Number(searchParams?.notes_limit) || 10, 100);
  
  return (
    <>
      <BreadcrumbsBrand slug={brand.slug} name={brand.name} />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <BrandTabs slug={brand.slug} />
          
          {/* Guide Content */}
          <div className="space-y-8">
            {/* Brand Guide Section */}
            <BrandGuideBlock slug={brand.slug} name={brand.name} />

            {/* Brand FAQ Section */}
            <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonicalUrl} />

                      {/* UGC Section - Recent tips + guided submission form */}
          {svcEnabled && (
            <div className="mt-8">
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <RecentCommunityNotes brandSlug={brand.slug} />
                </div>
                <div>
                  <SubmissionFormV2 brand={brand} />
                </div>
              </div>
            </div>
          )}

            {/* Parts Request Section with Anchor */}
            <BrandPartsFormSection>
              <PartsLeadForm brandSlug={brand.slug} brandName={brand.name} />
            </BrandPartsFormSection>
          </div>
        </div>
      </main>
    </>
  );
}
