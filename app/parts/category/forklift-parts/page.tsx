import Link from 'next/link';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: "Forklift Parts | Flat Earth Equipment",
  description: "High-quality forklift parts for all major brands. Fast shipping and same-day quotes available.",
};

export default function ForkliftPartsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Forklift Parts</h1>

      {/* Location Availability Section */}
      <section className="mb-12 bg-slate-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Available in Your Area</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">New Mexico</h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <Link href="/new-mexico/albuquerque" className="text-canyon-rust hover:underline">
                  Forklift parts available in Albuquerque
                </Link>
                <span className="text-sm text-slate-500 block">Fast delivery to 87101-87124</span>
              </li>
              <li>
                <Link href="/new-mexico/las-cruces" className="text-canyon-rust hover:underline">
                  Forklift parts available in Las Cruces
                </Link>
                <span className="text-sm text-slate-500 block">Quick shipping to 88001-88012</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Colorado</h3>
            <ul className="space-y-2 text-slate-700">
              <li>
                <Link href="/colorado/pueblo" className="text-canyon-rust hover:underline">
                  Forklift parts available in Pueblo
                </Link>
                <span className="text-sm text-slate-500 block">Same-day delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Rest of the category content */}
      {/* ... */}
    </main>
  );
} 