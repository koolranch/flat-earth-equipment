import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forklift Attachments | Material Handling Equipment | Flat Earth Equipment",
  description: "Complete selection of forklift attachments and material handling equipment. Forks, clamps, rotators, and specialized attachments for all major forklift brands.",
  keywords: [
    "forklift attachments",
    "material handling attachments", 
    "forklift forks",
    "clamps",
    "rotators",
    "industrial attachments"
  ],
  alternates: {
    canonical: "/parts/attachments",
  },
};

export default function AttachmentsPage() {
  // Attachment categories with explicit hrefs to avoid 404s
  // Only /parts/attachments/forks and /forks exist - others redirect to /parts
  const attachmentCategories = [
    {
      name: "Forks",
      slug: "forks",
      href: "/forks", // Dedicated forks page exists
      description: "Standard pallet forks, telehandler forks, block forks, and custom length options",
      features: ["Class II/III/IV", "36\"-96\" lengths", "ANSI certified", "All major brands"],
      image: "🍴"
    },
    {
      name: "Clamps",
      slug: "clamps",
      href: "/parts", // No dedicated page - link to parts catalog
      description: "Paper roll clamps, bale clamps, carton clamps, and specialized clamping attachments",
      features: ["Hydraulic operation", "Custom jaw configurations", "Side-shift compatible", "Heavy-duty construction"],
      image: "🗜️"
    },
    {
      name: "Rotators",
      slug: "rotators",
      href: "/parts", // No dedicated page - link to parts catalog
      description: "Fork rotators, load rotators, and rotating attachments for specialized handling",
      features: ["360° rotation", "Hydraulic drive", "Load sensing", "Precision control"],
      image: "🔄"
    },
    {
      name: "Side Shifters",
      slug: "side-shifters",
      href: "/parts", // No dedicated page - link to parts catalog
      description: "Hydraulic side shifters for precise load positioning and increased efficiency",
      features: ["Left/right positioning", "Integrated fork mounting", "Smooth operation", "High capacity"],
      image: "↔️"
    },
    {
      name: "Push-Pull Attachments",
      slug: "push-pull",
      href: "/parts", // No dedicated page - link to parts catalog
      description: "Slip sheet handling, push-pull attachments for efficient material transport",
      features: ["Slip sheet compatible", "Reduced packaging", "Fast cycle times", "Cost effective"],
      image: "⬅️➡️"
    },
    {
      name: "Specialized Attachments",
      slug: "specialized",
      href: "/parts", // No dedicated page - link to parts catalog
      description: "Custom and specialized attachments for unique material handling requirements",
      features: ["Custom engineering", "Application specific", "Heavy-duty design", "Expert support"],
      image: "🔧"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
        <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-canyon-rust transition-colors">Parts</Link>
        <span>/</span>
        <span className="text-slate-900">Attachments</span>
      </nav>

      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
          Forklift Attachments & Material Handling Equipment
        </h1>
        <p className="text-xl text-slate-700 mb-8 max-w-4xl leading-relaxed">
          Expand your forklift's capabilities with our comprehensive selection of attachments and specialized 
          material handling equipment. From standard forks to custom-engineered solutions, we provide 
          high-quality attachments for all major forklift brands and applications.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/quote" 
            className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
          >
            Get Quote
          </Link>
          <Link 
            href="/contact" 
            className="border-2 border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
          >
            Technical Support
          </Link>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🏗️</div>
          <h3 className="font-semibold mb-2">Heavy-Duty Construction</h3>
          <p className="text-sm text-slate-600">Built for industrial applications with high-strength materials</p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="font-semibold mb-2">Safety Certified</h3>
          <p className="text-sm text-slate-600">ANSI/ITSDF compliant with full documentation</p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🔧</div>
          <h3 className="font-semibold mb-2">Custom Solutions</h3>
          <p className="text-sm text-slate-600">Engineering support for specialized applications</p>
        </div>
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🚚</div>
          <h3 className="font-semibold mb-2">Fast Delivery</h3>
          <p className="text-sm text-slate-600">Freight is calculated at checkout.</p>
        </div>
      </div>

      {/* Attachment Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Attachment Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attachmentCategories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group block bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{category.image}</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-canyon-rust transition-colors">
                {category.name}
              </h3>
              <p className="text-slate-700 mb-4">{category.description}</p>
              <ul className="space-y-1">
                {category.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-sm text-slate-600 flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-canyon-rust font-medium group-hover:underline">
                View {category.name} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Applications Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Applications & Industries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Warehousing</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Pallet handling</li>
              <li>• Inventory management</li>
              <li>• Order fulfillment</li>
              <li>• Cross-docking</li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Manufacturing</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Raw material handling</li>
              <li>• Work-in-process transport</li>
              <li>• Finished goods movement</li>
              <li>• Assembly line support</li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Construction</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Building materials</li>
              <li>• Concrete blocks</li>
              <li>• Lumber handling</li>
              <li>• Site logistics</li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Specialized</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Paper/pulp industry</li>
              <li>• Steel/metal handling</li>
              <li>• Chemical/drums</li>
              <li>• Food & beverage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-900">Why Choose Flat Earth Equipment?</h2>
        <div className="bg-white rounded-xl p-8 shadow-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Technical Expertise</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Engineering support for custom applications
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Load calculation and safety analysis
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Compatibility verification for all brands
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Installation guidance and support
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quality Assurance</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  ANSI/ITSDF B56.1 compliance
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Rigorous quality control testing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  High-strength materials and construction
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Comprehensive warranty coverage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Attachments on the catalog</h2>
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
            Technical Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
