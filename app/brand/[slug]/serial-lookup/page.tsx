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
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;

// Brands that have working serial lookup tools (must match SerialLookupEmbed routes)
const BRANDS_WITH_SERIAL_TOOLS = new Set([
  'toyota', 'hyster', 'bobcat', 'crown', 'clark', 'cat', 'caterpillar',
  'doosan', 'jlg', 'karcher', 'factory-cat', 'factorycat', 'tennant',
  'haulotte', 'yale', 'raymond', 'ep', 'ep-equipment', 'linde',
  'mitsubishi', 'komatsu', 'case', 'case-construction', 'new-holland',
  'takeuchi', 'kubota', 'toro', 'xcmg', 'sinoboom', 'skyjack',
  'jungheinrich', 'gehl', 'hangcha', 'lull', 'manitou', 'unicarriers',
  'jcb', 'genie', 'hyundai'
]);

// Pre-generate static params for all brands with serial tools (SEO optimization)
export async function generateStaticParams() {
  return Array.from(BRANDS_WITH_SERIAL_TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }){
  const brand = await getBrand(params.slug);
  // Return minimal metadata if brand doesn't exist (will 404 in page)
  if (!brand) {
    return { title: 'Brand Not Found' };
  }
  // Return redirect metadata if brand doesn't have serial tool (will redirect in page)
  if (!BRANDS_WITH_SERIAL_TOOLS.has(params.slug)) {
    return { 
      title: `${brand.name} | Flat Earth Equipment`,
      robots: { index: false } // Don't index redirect pages
    };
  }
  
  const canonical = resolveCanonical(params.slug, 'serial');
  const fullUrl = `https://www.flatearthequipment.com${canonical}`;
  
  return { 
    title: `${brand.name} Serial Number Lookup | Flat Earth Equipment`, 
    description: `Find your ${brand.name} equipment serial number location and decode your serial for parts identification and service history.`,
    alternates: { 
      canonical: fullUrl,
      languages: {
        'en-US': canonical,
        'es-US': `/es/brand/${params.slug}/serial-lookup`
      }
    },
    openGraph: {
      title: `${brand.name} Serial Number Lookup`,
      description: `Find your ${brand.name} equipment serial number location and decode your serial for parts identification.`,
      url: fullUrl,
      type: 'website',
      siteName: 'Flat Earth Equipment'
    },
    twitter: {
      card: 'summary',
      title: `${brand.name} Serial Number Lookup`,
      description: `Find your ${brand.name} equipment serial number location and decode your serial.`
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
  
  // 404 if brand doesn't exist at all
  if (!brand) notFound();
  
  // Redirect to main brand page if brand exists but doesn't have serial tool
  // This preserves SEO value from backlinks instead of returning 404
  if (!BRANDS_WITH_SERIAL_TOOLS.has(params.slug)) {
    redirect(`/brand/${params.slug}`);
  }
  
  const ipsvcEnabled = process.env.NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS !== 'false';
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
          {ipsvcEnabled && (
            <div className="mt-8">
              <div className='grid gap-6 md:grid-cols-2 items-start'>
                <RecentCommunityNotes brandSlug={brand.slug} />
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
