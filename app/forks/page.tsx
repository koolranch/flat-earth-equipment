import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Forklift Forks | Heavy-Duty Material Handling Equipment | Flat Earth Equipment",
  description: "Premium forklift forks for all major brands. Class II, III, IV forks, pallet forks, telehandler forks, and custom lengths. ANSI/ITSDF certified with same-day quotes and expert technical support.",
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
    description: "Premium forklift forks for all major brands. ANSI/ITSDF certified with same-day quotes.",
    type: "website",
    images: [
      {
        url: "/images/insights/what-are-forklift-forks-made-of-2.jpg",
        width: 1216,
        height: 832,
        alt: "Heavy-duty forklift forks for industrial material handling"
      }
    ]
  }
};

export default function ForksPage() {
  return (
    <>
      {/* Structured Data */}
      <Script id="forks-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Forklift Forks",
          "description": "Premium forklift forks for all major brands. Class II, III, IV forks, pallet forks, telehandler forks, and custom lengths.",
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
          heavy-duty forklift forks built for the toughest material handling demands. We offer Class II,
          Class III, and Class IV forks in standard and custom lengths, including tapered pallet forks,
          block forks, and telehandler-compatible styles.
        </p>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Most Popular Fork Types</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Pallet forks (ITA hook mount)</li>
            <li>Telehandler forks</li>
            <li>Block handling forks</li>
            <li>Drum forks & lumber forks</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Common Specs</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Lengths: 36" – 96"</li>
            <li>Widths: 4" to 6"</li>
            <li>Capacities: up to 10,000 lbs</li>
            <li>Mount types: ITA Class II / III / IV, shaft mount, pin mount</li>
          </ul>
        </div>
      </div>

      <Image
        src="/images/insights/what-are-forklift-forks-made-of-2.jpg"
        alt="Forklift forks for sale"
        width={1216}
        height={832}
        className="rounded-xl mb-10 shadow"
      />

      <div className="space-y-6 text-gray-800 max-w-3xl">
        <p>
          Our forks meet or exceed ANSI/ITSDF B56.1 standards. All products are inspected for
          thickness, heel wear, and weld quality. Need help matching forks to your machine? Our team
          can assist with fork charts and ITA class selection.
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
              <p className="text-slate-700">Measure the overall length (tip to heel), width (side to side), and thickness (top to bottom). Also check hook spacing and carriage class. Our technical team can help verify measurements for proper fit.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Are your forks OEM quality?</h3>
              <p className="text-slate-700">We sell high-quality aftermarket forks manufactured to meet or exceed OEM specifications. They're fully compatible with major brands like Toyota, Hyster, Yale, Crown, and Cat, often at significant cost savings.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Do you offer custom length forks?</h3>
              <p className="text-slate-700">Yes, we manufacture custom length forks from 36" up to 120" or longer for specialized applications. Custom forks require load calculations and typically have a 2-3 week lead time.</p>
            </div>
          </div>
        </section>

        {/* Compatible Brands */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Compatible Forklift Brands</h2>
          <div className="bg-white rounded-xl p-8 shadow-lg border">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              {["Toyota", "Hyster", "Yale", "Crown", "Clark", "Cat", "Komatsu", "Mitsubishi", "Nissan", "Raymond", "Doosan", "JLG"].map((brand, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Need Expert Fork Selection?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Our technical experts provide free consultation to help you choose the perfect forks for your 
            specific application, ensuring safety, efficiency, and compliance.
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
                Technical Support
              </h3>
              <p className="text-slate-600">Get expert guidance on fork selection, load calculations, and safety compliance from our technical team.</p>
            </Link>
          </div>
        </section>
      </div>
      </main>
    </>
  );
} 