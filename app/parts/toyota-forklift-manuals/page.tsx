import { Metadata } from 'next';
import Link from 'next/link';
import ManualsTable from './ManualsTable';
import { toyotaForkliftManualsFAQs, generateFAQPageJSONLD, generateBreadcrumbJSONLD } from './faqs';

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

export const metadata: Metadata = {
  title: 'Toyota Forklift Manuals (PDF) | Free Downloads & Parts Help',
  description: 'Find Toyota forklift operator, parts, and service manuals (PDF). Filter by model or series. Missing one? Request it. Get parts help with fast shipping.',
  robots: 'index,follow',
  alternates: {
    canonical: '/parts/toyota-forklift-manuals'
  },
  openGraph: {
    title: 'Toyota Forklift Manuals (PDF) | Free Downloads & Parts Help',
    description: 'Find Toyota forklift operator, parts, and service manuals (PDF). Filter by model or series. Missing one? Request it. Get parts help with fast shipping.',
    url: '/parts/toyota-forklift-manuals',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toyota Forklift Manuals (PDF) | Free Downloads & Parts Help',
    description: 'Find Toyota forklift operator, parts, and service manuals (PDF). Filter by model or series. Missing one? Request it. Get parts help with fast shipping.'
  }
};

export default function ToyotaForkliftManualsPage() {
  const faqJSONLD = generateFAQPageJSONLD(toyotaForkliftManualsFAQs);
  const breadcrumbJSONLD = generateBreadcrumbJSONLD();

  return (
    <>
      {/* Meta robots tag */}
      <meta name="robots" content="index,follow" />
      
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJSONLD)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJSONLD)
        }}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-slate-900 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/parts" className="hover:text-slate-900 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded">
                Parts
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-900 font-medium">Toyota Forklift Manuals</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Toyota Forklift Manuals (PDF)</h1>
          <p className="text-sm text-slate-500 mb-4">Last updated: {today}</p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Access comprehensive Toyota forklift documentation including operator manuals, parts catalogs, and service guides. 
            Our collection covers popular series like 7FG, 8FG, 5FBE, 02-8FDF, and many others. Can&apos;t find your specific model? 
            We&apos;ll help you source the manual you need.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/support/request-manual?brand=toyota"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-2xl hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Request a Manual
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-800 font-medium rounded-2xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
          >
            Get Parts Help
          </Link>
        </div>

        {/* Filter + Table Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse Available Manuals</h2>
          <ManualsTable />
        </section>

        {/* Callout Card */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl shadow-sm p-6 mb-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Don&apos;t see your model?</h3>
          <p className="text-slate-700 mb-4">
            We&apos;ll find it for you. Our team has access to extensive manual archives and can source hard-to-find documentation 
            for older or specialized Toyota forklift models.
          </p>
          <Link
            href="/support/request-manual?brand=toyota"
            className="inline-flex items-center px-5 py-3 bg-orange-600 text-white font-medium rounded-2xl hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Request Your Manual
          </Link>
        </div>

        {/* How to Find Model Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How to Find Your Toyota Forklift Model and Serial</h2>
          <div className="prose prose-slate max-w-none">
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Serial plate location:</strong> Check the frame near the operator compartment, typically on the right side or behind the seat</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Firewall placement:</strong> Look on the firewall behind the operator seat for a metal identification plate</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Counterweight area:</strong> Some models have the serial plate mounted on the rear counterweight</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Format examples:</strong> Toyota models typically follow patterns like &ldquo;8FGCU25-12345&rdquo; or &ldquo;7FBEU18-67890&rdquo;</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Model breakdown:</strong> The first part (8FGCU25) indicates series, fuel type, and capacity; the number after the dash is the serial</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Common Series Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Toyota Series We Cover</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              '7FG Series',
              '8FG Series', 
              '5FBE Series',
              '02-8FDF Series',
              '7FBE Series',
              '6FBE Series',
              '8FDF Series',
              '7FBC Series',
              '8FBM Series',
              '5FBC Series',
              '6FG Series',
              '8FGF Series'
            ].map((series) => (
              <div key={series} className="bg-slate-50 rounded-lg px-4 py-3 text-center text-sm font-medium text-slate-700">
                {series}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {toyotaForkliftManualsFAQs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTAs */}
        <div className="bg-slate-50 rounded-2xl shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Parts or Additional Help?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            Our parts specialists can help you identify components from manual diagrams, provide quotes, 
            and ensure fast shipping for your Toyota forklift parts needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-2xl hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Get Parts Help
            </Link>
            <Link
              href="/brand/toyota"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-800 font-medium rounded-2xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
            >
              Toyota Parts & Info
            </Link>
            <Link
              href="/chargers"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-800 font-medium rounded-2xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
            >
              Electric Forklift Chargers
            </Link>
          </div>
        </div>

        {/* Trademark Notice */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Toyota is a registered trademark of Toyota Industries Corporation. Manuals provided for reference purposes. 
            Always follow your truck&apos;s official manual and OSHA/ANSI safety guidance for proper operation and maintenance.
          </p>
        </div>
      </main>

      {/* Future hook for server data (commented out for now) */}
      {/*
      // Server function to fetch manuals from Supabase
      async function getManuals(searchQuery?: string) {
        const supabase = supabaseServer();
        let query = supabase
          .from('manuals')
          .select('*')
          .eq('brand', 'toyota')
          .order('model');
        
        if (searchQuery) {
          query = query.or(`model.ilike.%${searchQuery}%,series.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
      */}
    </>
  );
}
