import { resolveCanonical } from '@/lib/brandCanon';
import BrandTabs from '@/components/brand/BrandTabs';
import BreadcrumbsBrand from '@/components/nav/BreadcrumbsBrand';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import SerialLookupEmbed from '@/components/brand/SerialLookupEmbed';
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
  
  const canonical = resolveCanonical(params.slug, 'serial');
  return { 
    title: `${brand.name} Serial Number Lookup | Flat Earth Equipment`, 
    description: `Find your ${brand.name} equipment serial number location and decode your serial for parts identification and service history.`,
    alternates: { canonical } 
  };
}

export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams?: { notes_limit?: string } }){
  const brand = await getBrand(params.slug);
  if (!brand) notFound();
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const url = `https://www.flatearthequipment.com/brand/${brand.slug}/serial-lookup`;
  
  // Allow larger list via search param (?notes_limit=50) when you want to see more
  const limit = Math.min(Number(searchParams?.notes_limit) || 10, 100);
  
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

          {/* UGC Section - Recent tips + guided submission form */}
          {svcEnabled && (
            <div className='mt-8 grid gap-6 md:grid-cols-5'>
              <div className='md:col-span-2'>
                <RecentCommunityNotes brandSlug={brand.slug} />
              </div>
              <div className='md:col-span-3'>
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
