import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import BrandTabs, { TabContent } from '@/components/brand/BrandTabs';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import FaultCodeSearch from '@/components/brand/FaultCodeSearch';
import SerialLookupEmbed from '@/components/brand/SerialLookupEmbed';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BrandSchemas } from '@/components/seo/BrandSchemas';
import { BreadcrumbsLite } from '@/components/brand/BreadcrumbsLite';
import { HubQuickLinks } from '@/components/brand/HubQuickLinks';
import BrandFaqJsonLd from '@/components/brand/BrandFaqJsonLd';
import SerialToolJsonLd from '@/components/seo/SerialToolJsonLd';
import JsonLd from '@/components/seo/JsonLd';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Map brand slugs to their serial lookup URLs
function getSerialToolUrl(slug: string): string {
  const serialToolMap: Record<string, string> = {
    'jlg': '/jlg-serial-number-lookup',
    'toyota': '/toyota-forklift-serial-lookup',
    'jcb': '/jcb-serial-number-lookup',
    'hyster': '/hyster-serial-number-lookup',
    'genie': '/genie-serial-number-lookup',
    'cat': '/cat-serial-number-lookup',
    'crown': '/crown-serial-number-lookup',
    'clark': '/clark-serial-number-lookup',
    'bobcat': '/bobcat-serial-number-lookup',
    'case': '/case-serial-number-lookup',
    // Add more mappings as needed
  };
  
  return serialToolMap[slug] || `/brand/${slug}?tab=serial`;
}

interface Brand {
  id: number;
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  equipment_types?: string[];
  has_serial_lookup: boolean;
  has_fault_codes: boolean;
  website_url?: string;
}

async function getBrand(slug: string): Promise<Brand | null> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return null;
  }
}

// Generate static params for existing brands
export async function generateStaticParams() {
  try {
    const { data: brands } = await supabase
      .from('brands')
      .select('slug');

    return brands?.map((brand) => ({
      slug: brand.slug,
    })) || [];
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);
  
  if (!brand) {
    return {
      title: 'Brand Not Found | Flat Earth Equipment',
      description: 'The requested brand page could not be found.'
    };
  }

  const equipmentList = brand.equipment_types?.join(', ') || 'equipment';
  
  return {
    title: `${brand.name} Parts, Serial Lookup & Fault Codes | Flat Earth Equipment`,
    description: `Complete ${brand.name} support: serial number lookup, fault code database, and parts sourcing for ${equipmentList}. Expert technical guidance and fast shipping.`,
    keywords: `${brand.name}, ${brand.name} parts, ${brand.name} serial number, ${brand.name} fault codes, ${equipmentList}`,
    openGraph: {
      title: `${brand.name} Equipment Support`,
      description: `Serial lookup, fault codes, and parts for ${brand.name} ${equipmentList}`,
      type: 'website',
      url: `/brand/${brand.slug}`,
      images: brand.logo_url ? [{ url: brand.logo_url, alt: `${brand.name} logo` }] : undefined
    },
    alternates: {
      canonical: `/brand/${brand.slug}`
    }
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);

  if (!brand) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
    { label: brand.name, href: `/brand/${brand.slug}` }
  ];

  const serialToolUrl = getSerialToolUrl(brand.slug);

  // BreadcrumbList JSON-LD
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Brands',
        item: 'https://www.flatearthequipment.com/brands'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: brand.name,
        item: `https://www.flatearthequipment.com/brand/${brand.slug}`
      }
    ]
  };

  return (
    <>
      <BrandSchemas brand={brand} />
      <BrandFaqJsonLd brandName={brand.name} />
      <SerialToolJsonLd 
        name={`${brand.name} Serial Number Lookup`} 
        url={serialToolUrl} 
      />
      <JsonLd json={breadcrumbListSchema} />
      <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <BreadcrumbsLite slug={brand.slug} name={brand.name} />
          
          <div className="mt-4 flex items-center gap-4">
            {brand.logo_url && (
              <img 
                src={brand.logo_url} 
                alt={`${brand.name} logo`}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {brand.name} Equipment Support
              </h1>
              <p className="text-lg text-slate-600 mt-1">
                Serial lookup, fault codes, and parts for {brand.equipment_types?.join(', ') || 'equipment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Brand Description */}
        {brand.description && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-700">{brand.description}</p>
          </div>
        )}

        {/* Quick Links */}
        <HubQuickLinks slug={brand.slug} serialToolUrl={serialToolUrl} />

        {/* Tabs Interface */}
        <BrandTabs 
          brandSlug={brand.slug}
          hasSerialLookup={brand.has_serial_lookup}
          hasFaultCodes={brand.has_fault_codes}
        >
          {/* Serial Lookup Tab */}
          {brand.has_serial_lookup && (
            <TabContent tabId="serial">
              <SerialLookupEmbed 
                brandSlug={brand.slug} 
                brandName={brand.name}
              />
            </TabContent>
          )}

          {/* Fault Codes Tab */}
          {brand.has_fault_codes && (
            <TabContent tabId="fault-codes">
              <FaultCodeSearch 
                brandSlug={brand.slug} 
                brandName={brand.name}
              />
            </TabContent>
          )}

          {/* Parts Request Tab */}
          <TabContent tabId="parts">
            <PartsLeadForm 
              brandSlug={brand.slug} 
              brandName={brand.name}
            />
          </TabContent>
        </BrandTabs>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Expert Support</h3>
            <p className="text-slate-600 text-sm mb-4">
              Our technical team has decades of experience with {brand.name} equipment.
            </p>
            <a 
              href="/contact" 
              className="text-brand-accent hover:underline text-sm font-medium"
            >
              Contact Technical Support →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Fast Shipping</h3>
            <p className="text-slate-600 text-sm mb-4">
              Free shipping on standard items with same-day processing for orders by 3 PM EST.
            </p>
            <a 
              href="/shipping-returns" 
              className="text-brand-accent hover:underline text-sm font-medium"
            >
              View Shipping Info →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Quality Guarantee</h3>
            <p className="text-slate-600 text-sm mb-4">
              All parts come with our quality guarantee and 30-day return policy.
            </p>
            <a 
              href="/warranty" 
              className="text-brand-accent hover:underline text-sm font-medium"
            >
              Learn About Warranty →
            </a>
          </div>
        </div>

        {/* Related Brands */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Other Brands We Support</h3>
          <div className="flex flex-wrap gap-2">
            {/* These would be dynamically loaded from other brands */}
            <a href="/brand/toyota" className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50">Toyota</a>
            <a href="/brand/hyster" className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50">Hyster</a>
            <a href="/brand/crown" className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50">Crown</a>
            <a href="/brand/clark" className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50">Clark</a>
            <a href="/brand/cat" className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50">CAT</a>
            <a href="/brands" className="px-3 py-1 bg-brand-accent text-white rounded-full text-sm hover:bg-brand-accent-hover">View All Brands →</a>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}