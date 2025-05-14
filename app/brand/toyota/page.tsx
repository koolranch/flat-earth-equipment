import Link from 'next/link';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: "Toyota Forklift Parts | Flat Earth Equipment",
  description: "Shop high-quality Toyota forklift parts with fast U.S. shipping.",
};

export default function ToyotaPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Toyota Forklift Parts</h1>

      {/* Location Availability Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available in Your Area</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-3">New Mexico</h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <Link href="/new-mexico/albuquerque" className="text-canyon-rust hover:underline">
                  Toyota forklift parts available in Albuquerque
                </Link>
                <span className="text-sm text-slate-500 block">Fast delivery to 87101-87124</span>
              </li>
              <li>
                <Link href="/new-mexico/las-cruces" className="text-canyon-rust hover:underline">
                  Toyota forklift parts available in Las Cruces
                </Link>
                <span className="text-sm text-slate-500 block">Quick shipping to 88001-88012</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-3">Colorado</h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <Link href="/colorado/pueblo" className="text-canyon-rust hover:underline">
                  Toyota forklift parts available in Pueblo
                </Link>
                <span className="text-sm text-slate-500 block">Same-day delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Brand Description */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">About Toyota Forklift Parts</h2>
        <p className="text-slate-700 mb-6">
          We stock a comprehensive selection of Toyota forklift parts, including maintenance items, wear parts, and major components. Our inventory covers all Toyota forklift series, from the compact 5-Series to the heavy-duty 8-Series.
        </p>
      </section>

      {/* Popular Parts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Popular Toyota Parts</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Maintenance Parts</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Filters</li>
              <li>Belts</li>
              <li>Brake components</li>
              <li>Hydraulic fluids</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Wear Parts</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Forks</li>
              <li>Wheels</li>
              <li>Bearings</li>
              <li>Seals</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-2">Major Components</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Mast assemblies</li>
              <li>Control valves</li>
              <li>Drive motors</li>
              <li>Steering components</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Need Toyota Parts?</h2>
        <p className="text-slate-700 mb-6">
          Get fast quotes for Toyota forklift parts. Our team can help you find the right components for your equipment.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-canyon-rust text-white px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
        >
          Request a Quote
        </Link>
      </section>
    </main>
  );
} 