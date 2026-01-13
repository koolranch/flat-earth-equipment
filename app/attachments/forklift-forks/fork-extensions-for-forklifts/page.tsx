import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fork Extensions for Forklifts | Heavy-Duty Forklift Fork Extensions | Flat Earth Equipment",
  description: "Professional fork extensions for forklifts - extend your reach safely. Quality forklift fork extensions for all major brands. Free shipping & expert support.",
  keywords: "fork extensions for forklifts, forklift fork extensions, fork extensions, forklift attachments, pallet fork extensions, fork slippers, sliding fork extensions",
  alternates: {
    canonical: "/attachments/forklift-forks/fork-extensions-for-forklifts",
  },
  openGraph: {
    title: "Fork Extensions for Forklifts | Flat Earth Equipment",
    description: "Professional fork extensions for forklifts - extend your reach safely. Quality forklift fork extensions for all major brands.",
    type: "website",
    url: "https://www.flatearthequipment.com/attachments/forklift-forks/fork-extensions-for-forklifts",
  },
};

export default function ForkExtensionsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Fork Extensions for Forklifts
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Extend your forklift's reach with professional-grade fork extensions. Built for safety and durability, 
          our forklift fork extensions help you handle longer loads with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/quote" 
            className="bg-canyon-rust hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Get Quote for Fork Extensions
          </Link>
          <Link 
            href="/contact" 
            className="border-2 border-canyon-rust text-canyon-rust hover:bg-canyon-rust hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Expert Consultation
          </Link>
        </div>
      </div>

      {/* Key Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-canyon-rust text-3xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold mb-3">Universal Compatibility</h3>
          <p className="text-gray-700">
            Fork extensions designed to fit most standard forklift forks from major brands including Toyota, Hyster, Cat, and Crown.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-canyon-rust text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-3">Quick Installation</h3>
          <p className="text-gray-700">
            Easy slip-on design allows operators to install and remove fork extensions quickly without tools or modifications.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-canyon-rust text-3xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-3">Safety Certified</h3>
          <p className="text-gray-700">
            All fork extensions meet OSHA and ANSI safety standards with proper load capacity ratings and safety locks.
          </p>
        </div>
      </div>

      {/* Product Image */}
      <div className="mb-12">
        <Image
          src="/images/insights/what-are-forklift-forks-made-of-2.jpg"
          alt="Fork extensions for forklifts - professional grade forklift fork extensions"
          width={1216}
          height={832}
          className="rounded-xl shadow-lg w-full"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-6">What Are Fork Extensions for Forklifts?</h2>
          <div className="space-y-4 text-gray-800">
            <p>
              Fork extensions for forklifts are forklift attachments that slide over your existing forks to extend their length. 
              Also known as fork slippers or sliding fork extensions, these attachments allow operators to safely handle 
              longer pallets and materials that exceed the standard fork length.
            </p>
            <p>
              Professional fork extensions are essential for warehouses, manufacturing facilities, and distribution centers 
              that regularly handle oversized loads, lumber, piping, or extended pallets.
            </p>
            <p>
              Our forklift fork extensions feature secure locking mechanisms and are manufactured from high-strength steel 
              to maintain load integrity while extending your operational capabilities.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Fork Extension Specifications</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Standard Sizes Available:</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Lengths:</strong> 48", 60", 72", 84", 96"</li>
              <li><strong>Widths:</strong> 4", 5", 6" (to match fork width)</li>
              <li><strong>Thickness:</strong> 1.5" to 2.5"</li>
              <li><strong>Load Capacity:</strong> Up to 5,000 lbs per pair</li>
              <li><strong>Mount Type:</strong> Slip-on with safety locks</li>
              <li><strong>Material:</strong> High-strength alloy steel</li>
            </ul>
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">
                <strong>Safety Note:</strong> Fork extensions reduce your forklift's load capacity. 
                Always consult your load chart when using extensions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Common Applications for Fork Extensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-canyon-rust/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-canyon-rust text-2xl">🏗️</span>
            </div>
            <h3 className="font-semibold mb-2">Construction Materials</h3>
            <p className="text-sm text-gray-600">Lumber, piping, steel beams, and building supplies</p>
          </div>
          <div className="text-center">
            <div className="bg-canyon-rust/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-canyon-rust text-2xl">📦</span>
            </div>
            <h3 className="font-semibold mb-2">Extended Pallets</h3>
            <p className="text-sm text-gray-600">Oversized pallets and custom packaging solutions</p>
          </div>
          <div className="text-center">
            <div className="bg-canyon-rust/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-canyon-rust text-2xl">🏭</span>
            </div>
            <h3 className="font-semibold mb-2">Manufacturing</h3>
            <p className="text-sm text-gray-600">Long materials, machinery components, and assemblies</p>
          </div>
          <div className="text-center">
            <div className="bg-canyon-rust/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-canyon-rust text-2xl">🚛</span>
            </div>
            <h3 className="font-semibold mb-2">Distribution</h3>
            <p className="text-sm text-gray-600">Loading/unloading trucks with extended cargo</p>
          </div>
        </div>
      </div>

      {/* Installation & Safety */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-6">Installation & Safety Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Installation Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Ensure forklift is on level ground with forks lowered</li>
              <li>Slide fork extensions over existing forks</li>
              <li>Align extension heels with fork heels</li>
              <li>Engage safety locks or retention devices</li>
              <li>Verify secure attachment before lifting loads</li>
            </ol>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Safety Requirements:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Extensions must be at least 60% of load length</li>
              <li>Use proper load capacity calculations</li>
              <li>Regular inspection for wear and damage</li>
              <li>Operator training on extended load handling</li>
              <li>Compliance with OSHA 1910.178 standards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">How do fork extensions affect my forklift's capacity?</h3>
            <p className="text-gray-700">
              Fork extensions reduce your forklift's load capacity because they move the load center forward. 
              Always consult your forklift's load capacity chart and calculate the new capacity based on the extended load center distance.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">What length fork extensions do I need?</h3>
            <p className="text-gray-700">
              Fork extensions should extend at least 60% of the load length for stability. For example, if handling 8-foot materials, 
              your extensions should be at least 60" long to provide adequate support.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">Are fork extensions compatible with all forklifts?</h3>
            <p className="text-gray-700">
              Most fork extensions are designed to fit standard ITA Class II, III, and IV forks. However, it's important to verify 
              compatibility with your specific fork dimensions and forklift model before purchasing.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3">How often should fork extensions be inspected?</h3>
            <p className="text-gray-700">
              OSHA requires daily inspection of forklift attachments. Check for cracks, wear, proper fit, and functioning safety locks. 
              Schedule professional inspections annually or per manufacturer recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-canyon-rust text-white rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Extend Your Forklift's Reach?</h2>
        <p className="text-xl mb-6">
          Get professional fork extensions for your forklift fleet. Expert consultation and competitive pricing available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/quote" 
            className="bg-white text-canyon-rust hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Request Fork Extension Quote
          </Link>
          <Link 
            href="/contact" 
            className="border-2 border-white text-white hover:bg-white hover:text-canyon-rust font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Contact Our Experts
          </Link>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Forklift Attachments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/forks" className="group">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2 group-hover:text-canyon-rust">Forklift Forks</h3>
              <p className="text-gray-600 text-sm">Replacement forks for all major forklift brands</p>
            </div>
          </Link>
          <Link href="/parts" className="group">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2 group-hover:text-canyon-rust">Forklift Parts</h3>
              <p className="text-gray-600 text-sm">OEM and aftermarket forklift parts inventory</p>
            </div>
          </Link>
          <Link href="/safety" className="group">
            <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2 group-hover:text-canyon-rust">Operator Training</h3>
              <p className="text-gray-600 text-sm">OSHA-compliant forklift certification courses</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
} 