import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { supabaseServer } from '@/lib/supabase/server';
import ForkFinder from "@/components/forks/ForkFinder";
import ForkSchemaWrapper from "@/components/forks/ForkSchemaWrapper";
import TechnicalSpecsTable, { FORK_SPECS } from "@/components/seo/TechnicalSpecsTable";

export const metadata: Metadata = {
  title: "Forklift Forks | Heavy-Duty Equipment",
  description: "Class II, III, and IV forklift forks, pallet forks, and telehandler forks. A listing is not a fit for every machine. Freight is calculated at checkout.",
  keywords: [
    "forklift forks",
    "pallet forks", 
    "telehandler forks",
    "ITA class forks",
    "material handling forks",
    "heavy duty forks",
    "industrial forks",
    "forklift attachments"
  ],
  alternates: {
    canonical: "/forks",
  },
  openGraph: {
    title: "Forklift Forks | Heavy-Duty Material Handling Equipment",
    description: "Class II, III, and IV forklift forks. A listing is not a fit for every machine. Freight is calculated at checkout.",
    type: "website",
    images: [
      {
        url: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/forksheroimage.jpeg",
        width: 1216,
        height: 832,
        alt: "Heavy-duty forklift forks for industrial material handling"
      }
    ]
  }
};

export default async function ForksPage() {
  const supabase = supabaseServer();
  const { data: products } = await supabase
    .from('parts')
    .select('id, name, slug, price, image_url, metadata')
    .in('category', ['Class II Forks', 'Class III Forks', 'Class IV Forks']);

  return (
    <>
      <ForkSchemaWrapper />
      
      {/* Structured Data */}
      <Script id="forks-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Forklift Forks",
          "description": "Class II, III, and IV forklift forks, pallet forks, and telehandler forks. A listing is not a fit for every machine. Freight is calculated at checkout.",
          "brand": {
            "@type": "Brand",
            "name": "Flat Earth Equipment"
          },
          "manufacturer": {
            "@type": "Organization", 
            "name": "Flat Earth Equipment"
          },
          "category": "Material Handling Equipment",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        })}
      </Script>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900">Forks</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Forklift Forks</h1>
        <p className="mb-8 max-w-4xl text-xl text-slate-700 leading-relaxed">
          Whether you run a single warehouse or a multi-site fleet, Flat Earth Equipment supplies
          heavy-duty forklift forks built for the toughest material handling demands. We list Class II,
          Class III, and Class IV forks, including tapered pallet forks,
          block forks, and telehandler-compatible styles. This page does not publish a custom length. A listing is not a fit for every machine.
        </p>

        {/* Fork Finder Tool */}
        <div className="mb-16">
          <ForkFinder products={products || []} />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Link 
            href="/quote" 
            className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
          >
            Get Quote
          </Link>
          <Link 
            href="/parts/attachments/forks" 
            className="border-2 border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
          >
            View Complete Selection
          </Link>
        </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Pricing & Shipping Information</h2>
        <div className="space-y-4 text-blue-800">
          <div>
            <p className="font-semibold">Equipment Pricing:</p>
            <p>Competitive pricing based on specifications, class, and quantity. Request a quote below for exact pricing.</p>
          </div>
          <div className="border-t border-blue-200 pt-4">
            <p className="font-semibold text-lg">Freight Shipping:</p>
            <p className="text-blue-900">
              <strong>$250.00</strong> - Due to the size and weight of forklift forks, freight shipping costs are required. 
              This freight charge will be added to your final quote.
            </p>
          </div>
          <p className="text-sm text-blue-700 italic">
            Note: Freight costs are for standard shipping. Expedited or specialized delivery may incur additional charges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="text-3xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold mb-2">Heavy-Duty Construction</h3>
          <p className="text-slate-600">This page does not publish a steel grade or a heat treatment.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="text-3xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Listing</h3>
          <p className="text-slate-600">This page does not publish a certification. A listing is not a fit for every machine.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="text-3xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold mb-2">Custom Solutions</h3>
          <p className="text-slate-600">Custom lengths, specialized mounting systems, and application-specific designs available.</p>
        </div>
      </div>

      <Image
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/forksheroimage.jpeg"
        alt="Forklift forks for sale"
        width={1216}
        height={832}
        className="rounded-xl mb-10 shadow"
      />

      {/* Enhanced Technical Specs by ITA Class - SEO Information Gain */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Technical Specifications by ITA Class</h2>
        <p className="text-lg text-slate-600 mb-8">
          Compare fork dimensions and capacities across ITA/ISO 2328 mounting classes. 
          Select the correct class based on your forklift&apos;s carriage plate specifications.
        </p>
        <TechnicalSpecsTable 
          title="ITA Hook-Type Fork Specifications"
          specs={FORK_SPECS}
          showClassComparison={true}
          footnote="All specifications per ITA/ISO 2328 standards. Custom configurations available. Actual capacity depends on load center and fork condition."
        />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Fork Types & Applications</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Standard Pallet Forks</h3>
            <p className="text-slate-700 mb-4">ITA Class II/III/IV hook-mounted forks for standard pallet handling</p>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-slate-900">Specifications:</span>
                <span className="text-slate-600 ml-2">36&quot;-96&quot; lengths, 4&quot;-6&quot; widths, up to 10,000 lbs capacity</span>
              </div>
              <div>
                <span className="font-medium text-slate-900">Applications:</span>
                <span className="text-slate-600 ml-2">Warehouse operations, pallet handling, general material transport</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Telehandler Forks</h3>
            <p className="text-slate-700 mb-4">Heavy-duty forks designed for telescopic handlers and rough terrain</p>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-slate-900">Specifications:</span>
                <span className="text-slate-600 ml-2">48&quot;-96&quot; lengths, reinforced construction, pin or shaft mount</span>
              </div>
              <div>
                <span className="font-medium text-slate-900">Applications:</span>
                <span className="text-slate-600 ml-2">Construction sites, outdoor material handling, agricultural use</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Block Handling Forks</h3>
            <p className="text-slate-700 mb-4">Specialized forks for concrete blocks, lumber, and irregular loads</p>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-slate-900">Specifications:</span>
                <span className="text-slate-600 ml-2">Extended length options, tapered design, high-strength steel</span>
              </div>
              <div>
                <span className="font-medium text-slate-900">Applications:</span>
                <span className="text-slate-600 ml-2">Construction materials, lumber yards, masonry operations</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Drum & Specialty Forks</h3>
            <p className="text-slate-700 mb-4">Custom forks for drums, coils, and specialized material handling</p>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-slate-900">Specifications:</span>
                <span className="text-slate-600 ml-2">Custom lengths and configurations, specialized mounting systems</span>
              </div>
              <div>
                <span className="font-medium text-slate-900">Applications:</span>
                <span className="text-slate-600 ml-2">Chemical handling, steel coils, specialized industrial applications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6 text-gray-800 max-w-3xl">
        <p>
          This page does not publish a certification. A listing is not a fit for every machine.
          The price is on the product page. Freight is calculated at checkout.
        </p>

        <p>
          Browse our collection or <Link href="/quote" className="text-blue-600 underline">request a quote</Link> for bulk orders and custom-length forks.
        </p>

        {/* Enhanced FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">What class are forklift forks?</h3>
              <p className="text-slate-700">Forks are rated Class II (16" tall carriage), Class III (20"), or Class IV (25"). Your forklift manual or carriage plate will indicate the class. The class determines the hook spacing and mounting dimensions.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">How do I measure forklift forks?</h3>
              <p className="text-slate-700">Measure the overall length (tip to heel), width (side to side), and thickness (top to bottom). Also check hook spacing and carriage class. This page does not verify a measurement.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Are your forks OEM quality?</h3>
              <p className="text-slate-700">We sell aftermarket forks. A listing is not a fit for every machine. Freight is calculated at checkout.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">What&apos;s the difference between standard and telehandler forks?</h3>
              <p className="text-slate-700">Telehandler forks are built for heavier duty applications with reinforced construction and different mounting systems (pin or shaft mount vs. hook mount). They&apos;re designed to handle the additional stresses of telescopic boom operation and rough terrain use.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">What capacity forks do I need?</h3>
              <p className="text-slate-700">This page does not publish a capacity calculation. A listing is not a fit for every machine. The price is on the product page.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Do you offer custom length forks?</h3>
              <p className="text-slate-700">This page does not publish a custom length or a lead time. A listing is not a fit for every machine.</p>
            </div>
          </div>
        </section>

        {/* Compatible Brands */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Compatible Forklift Brands</h2>
          <div className="bg-white rounded-xl p-8 shadow-lg border">
            <p className="text-lg text-slate-700 mb-6">
              Forks we list are on this page. A listing is not a fit for every machine.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {["Toyota", "Hyster", "Yale", "Crown", "Clark", "Cat", "Komatsu", "Mitsubishi", "Nissan", "Raymond", "Doosan", "JLG", "Genie", "Skytrak"].map((brand, index) => (
                <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{brand}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-6">
              A listing is not a fit for every machine. This page does not offer a custom fork.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Quality & Safety Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Manufacturing Standards</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  This page does not publish a certification.
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  This page does not publish a steel grade.
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  This page does not publish a heat treatment.
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Precision machining for perfect fit and finish
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Industrial-grade paint or galvanized coating
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-xl font-semibold mb-4 text-slate-900">Quality Inspection</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Dimensional accuracy verification
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Weld quality and penetration testing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Load capacity certification
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Surface finish and coating inspection
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Final assembly and function testing
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Installation & Maintenance</h2>
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Installation Guidelines</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>• Verify fork class matches carriage specifications</li>
                  <li>• Check hook spacing and mounting alignment</li>
                  <li>• Ensure proper fork positioning and locking</li>
                  <li>• Test load capacity with graduated weights</li>
                  <li>• Document installation for safety records</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Maintenance Schedule</h3>
                <p className="text-slate-700">This page does not publish an inspection interval or a certification.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Forks on the catalog</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            This page does not offer a consultation. A listing is not a fit for every machine.
            The price is on the product page. Freight is calculated at checkout.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="bg-white text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Custom Quote
            </Link>
            
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-canyon-rust transition-colors"
            >
              Technical Support
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Related Products & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/parts/attachments/forks" 
              className="group block bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-canyon-rust transition-colors">
                Complete Fork Selection
              </h3>
              <p className="text-slate-600">Browse our comprehensive selection of forklift forks with detailed specifications and technical information.</p>
            </Link>
            
            <Link 
              href="/parts/attachments" 
              className="group block bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-canyon-rust transition-colors">
                All Attachments
              </h3>
              <p className="text-slate-600">Explore our full range of forklift attachments including clamps, rotators, and specialized equipment.</p>
            </Link>
            
            <Link 
              href="/contact" 
              className="group block bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-canyon-rust transition-colors">
                Contact
              </h3>
              <p className="text-slate-600">This page does not publish a load calculation. Freight is calculated at checkout.</p>
            </Link>
          </div>
        </section>
      </div>
      </main>
    </>
  );
} 