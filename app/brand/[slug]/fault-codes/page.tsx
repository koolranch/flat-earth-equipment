import { resolveCanonical } from '@/lib/brandCanon';
import BrandTabs from '@/components/brand/BrandTabs';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import FaultSearch from '@/components/faults/FaultSearch';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import RecentCommunityNotes from '@/components/brand/RecentCommunityNotes';
import SubmissionFormV2 from '@/components/brand/SubmissionFormV2';
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

export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams?: { notes_limit?: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const canonical = resolveCanonical(params.slug, 'fault-codes');
  
  // Allow larger list via search param (?notes_limit=50) when you want to see more
  const limit = Math.min(Number(searchParams?.notes_limit) || 10, 100);
  
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
                {brand.name} Fault Code Database
              </h3>
              <p className="text-sm text-muted-foreground">
                Search our database of common {brand.name} fault codes and diagnostic guidance. 
                Use these as a starting point - always confirm with official service procedures.
              </p>
            </div>
            <FaultSearch brand={brand.slug} />
          </div>

          {/* Brand FAQ Section */}
          <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonical} />

          {/* UGC Section - Recent tips + guided submission form */}
          {svcEnabled && (
            <div className='mt-8 grid gap-6 lg:grid-cols-2'>
              <div>
                <RecentCommunityNotes brandSlug={brand.slug} />
              </div>
              <div>
                <SubmissionFormV2 brand={brand} />
              </div>
            </div>
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
