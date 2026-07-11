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
  if (!brand) return { title: 'Brand Not Found' };
  
  const canonical = resolveCanonical(params.slug, 'fault-codes');
  const fullUrl = `https://www.flatearthequipment.com${canonical}`;
  const isJcb = params.slug === 'jcb';
  
  return { 
    title: isJcb
      ? 'JCB Fault Codes & Diagnostics | Common Codes + Parts | Flat Earth Equipment'
      : `${brand.name} Fault Codes & Diagnostics | Flat Earth Equipment`, 
    description: isJcb
      ? 'Look up common JCB fault codes (P0087, DEF/SCR, transmission), how to pull codes from the dash, and shop related JCB filters, fuel, and sensor parts.'
      : `Search ${brand.name} error codes and diagnostic trouble codes with solutions, causes, and troubleshooting steps for your equipment.`,
    alternates: { 
      canonical: fullUrl,
      languages: {
        'en-US': fullUrl,
        'es-US': `https://www.flatearthequipment.com/es/brand/${params.slug}/fault-codes`,
        'x-default': fullUrl
      }
    },
    openGraph: {
      title: `${brand.name} Fault Codes & Diagnostics`,
      description: isJcb
        ? 'Common JCB fault codes, retrieval steps, and related parts from our catalog.'
        : `Search ${brand.name} error codes and diagnostic trouble codes with solutions and troubleshooting steps.`,
      url: fullUrl,
      type: 'website',
      siteName: 'Flat Earth Equipment'
    },
    twitter: {
      card: 'summary',
      title: `${brand.name} Fault Codes & Diagnostics`,
      description: `Search ${brand.name} error codes and diagnostic trouble codes with solutions.`
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
  const canonical = resolveCanonical(params.slug, 'fault-codes');
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
                {brand.name} Fault Codes & Diagnostics
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Search our database of common {brand.name} fault codes and diagnostic guidance.
                Use these as a starting point — always confirm with official service procedures
                before replacing parts.
              </p>
            </div>
            <FaultSearch brand={brand.slug} />
          </div>

          {isJcb ? (
            <>
              <section className="mt-8 rounded-xl border bg-white p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">How to pull JCB codes</h2>
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
                url={canonical}
                faqKey="jcb-faults"
                heading="JCB fault code FAQs"
              />
            </>
          ) : (
            <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonical} />
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
