import { resolveCanonical } from '@/lib/brandCanon';
import BrandTabs from '@/components/brand/BrandTabs';
import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandPartsFormSection from '@/components/brand/BrandPartsFormSection';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import SubmissionForm from '@/components/brand/SubmissionForm';
import CommunityNotes from '@/components/brand/CommunityNotes';
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
  
  const svcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
  const canonical = resolveCanonical(params.slug, 'guide');
  
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
            <BrandFAQBlock slug={brand.slug} name={brand.name} url={canonical} />

            {/* UGC Sections - Only on Guide Tab */}
            {svcEnabled && (
              <>
                <SubmissionForm brand={brand} />
                <CommunityNotes brandSlug={brand.slug} />
              </>
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
