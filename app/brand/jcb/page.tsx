import React from "react";
import Link from 'next/link';
import { generatePageAlternates } from '@/app/seo-defaults';

export const metadata = {
  title: "JCB Telehandler Parts, Fault Codes & Resources | Flat Earth Equipment",
  description: "Complete JCB telehandler resource hub: serial number lookup, 50+ fault codes database, battery location guide, parts catalog for Loadall and excavator models.",
  alternates: generatePageAlternates("/brand/jcb"),
};

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">JCB Telehandler & Excavator Resources</h1>
      <p className="text-lg text-slate-600 mb-12">
        Complete diagnostic tools, fault codes, maintenance guides, and parts for JCB Loadall telehandlers and JS series excavators.
      </p>

      {/* Quick Tools Grid */}
      <section className="mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/jcb-serial-number-lookup" className="group bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Serial Number Lookup</h3>
          <p className="text-sm text-slate-600 mb-3">Identify your JCB telehandler or excavator model and year.</p>
          <span className="text-yellow-600 font-semibold text-sm group-hover:underline">Use Tool →</span>
        </Link>

        <Link href="/rental/telehandler/jcb-telehandler-fault-codes-list" className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Fault Codes Database</h3>
          <p className="text-sm text-slate-600 mb-3">Searchable database of 50+ JCB diagnostic codes with troubleshooting.</p>
          <span className="text-blue-600 font-semibold text-sm group-hover:underline">Browse Codes →</span>
        </Link>

        <Link href="/rental/telehandler/jcb-telehandler-battery-location" className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">🔋</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Battery Location Guide</h3>
          <p className="text-sm text-slate-600 mb-3">Find and access the battery in JCB 510-56, 520-50, and other models.</p>
          <span className="text-green-600 font-semibold text-sm group-hover:underline">View Guide →</span>
        </Link>

        <Link href="/parts?brand=jcb" className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">JCB Parts Catalog</h3>
          <p className="text-sm text-slate-600 mb-3">Browse batteries, sensors, hydraulic components for all JCB models.</p>
          <span className="text-purple-600 font-semibold text-sm group-hover:underline">Shop Parts →</span>
        </Link>
      </section>

      {/* Popular Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular JCB Guides</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Link href="/rental/telehandler/jcb-telehandler-battery-location" className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-yellow-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔋</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Battery Location & Replacement</h3>
                <p className="text-sm text-slate-600 mb-3">Step-by-step guide to accessing batteries in JCB 510-56, 520-50, and other telehandler models.</p>
                <span className="text-yellow-600 font-semibold text-sm">View Full Guide →</span>
              </div>
            </div>
          </Link>

          <Link href="/rental/telehandler/jcb-telehandler-fault-codes-list" className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-yellow-500 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Complete Fault Code Database</h3>
                <p className="text-sm text-slate-600 mb-3">50+ searchable fault codes for JCB Loadall and excavators with expert troubleshooting.</p>
                <span className="text-yellow-600 font-semibold text-sm">Browse Codes →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Parts by Category */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Shop JCB Parts by Category</h2>
        <p className="text-slate-600 mb-6">Browse 700+ aftermarket JCB replacement parts. Competitive pricing — fast shipping nationwide.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'Filters',            slug: 'jcb-filters',          count: 32 },
            { name: 'Brakes',             slug: 'jcb-brakes',           count: 21 },
            { name: 'Electrical',         slug: 'jcb-electrical',       count: 21 },
            { name: 'Engine Parts',       slug: 'jcb-engine-parts',     count: 25 },
            { name: 'Fuel System',        slug: 'jcb-fuel-system',      count: 16 },
            { name: 'Switches & Sensors', slug: 'jcb-switches-sensors', count: 26 },
            { name: 'Hydraulics',         slug: 'jcb-hydraulics',       count: 26 },
            { name: 'Hydraulic Valves',   slug: 'jcb-hydraulic-valves', count: 16 },
            { name: 'Seals & Gaskets',    slug: 'jcb-seals-gaskets',    count: 10 },
            { name: 'Cooling',            slug: 'jcb-cooling',          count: 15 },
            { name: 'Cab & Body',         slug: 'jcb-cab-body',         count: 38 },
            { name: 'Controls',           slug: 'jcb-controls',         count: 13 },
            { name: 'Hoses & Fittings',   slug: 'jcb-hoses',           count: 13 },
            { name: 'Pins & Bushings',    slug: 'jcb-pins-bushings',    count: 12 },
            { name: 'Undercarriage',      slug: 'jcb-undercarriage',    count: 20 },
            { name: 'Lights',             slug: 'jcb-lights',           count: 6  },
            { name: 'Mirrors',            slug: 'jcb-mirrors',          count: 4  },
            { name: 'Seats',              slug: 'jcb-seats',            count: 9  },
            { name: 'Steering',           slug: 'jcb-steering',         count: 5  },
            { name: 'Wheels & Rims',      slug: 'jcb-wheels',           count: 6  },
            { name: 'Exhaust',            slug: 'jcb-exhaust',          count: 2  },
            { name: 'Mounts & Dampers',   slug: 'jcb-mounts-dampers',   count: 1  },
            { name: 'All JCB Parts',      slug: 'jcb-general',          count: 400 },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/parts/category/${cat.slug}`}
              className="group bg-white border-2 border-slate-200 rounded-xl px-4 py-3 hover:border-[#F76511] hover:shadow-md transition-all"
            >
              <span className="font-semibold text-slate-900 group-hover:text-[#F76511] text-sm transition-colors">
                {cat.name}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">{cat.count} parts</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Common JCB Models */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular JCB Models We Support</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 mb-2">Loadall Telehandlers</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 510-56, 520-50</li>
              <li>• 525-60, 531-70</li>
              <li>• 535-95, 540-140</li>
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 mb-2">JS Series Excavators</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• JS200, JS220</li>
              <li>• JS130, JS160</li>
              <li>• Compact models</li>
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 mb-2">Compact Equipment</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Skid steers</li>
              <li>• Compact track loaders</li>
              <li>• Mini excavators</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">JCB Parts Available in Your Area</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900">Texas</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/texas/dallas-fort-worth" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                  JCB parts in Dallas-Fort Worth →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">DFW Metroplex coverage</span>
              </li>
              <li>
                <Link href="/texas/el-paso" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                  JCB parts in El Paso →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">West Texas delivery</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900">Mountain West</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/wyoming/cheyenne" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                  JCB parts in Cheyenne →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">Wyoming service area</span>
              </li>
              <li>
                <Link href="/montana/bozeman" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                  JCB parts in Bozeman →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">Gallatin Valley delivery</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Parts CTA */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Need JCB Telehandler Parts?</h2>
        <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
          From batteries to hydraulic components, we stock precision-fit parts for all JCB Loadall and excavator models. Fast shipping nationwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=jcb" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
            Browse JCB Parts →
          </Link>
          <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
            Request Quote
          </Link>
        </div>
      </section>
    </main>
  );
}

