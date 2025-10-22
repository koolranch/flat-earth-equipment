import React from "react";
import Link from 'next/link';

export const metadata = {
  title: "Toyota Forklift Parts, Fault Codes & Resources | Flat Earth Equipment",
  description: "Complete Toyota forklift resource hub: serial number lookup, 40+ fault codes database, parts catalog, and expert guides for all Toyota models.",
};

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Toyota Forklift Resources</h1>
      <p className="text-lg text-slate-600 mb-12">
        Complete diagnostic tools, fault codes, parts, and expert guides for Toyota forklifts.
      </p>

      {/* Quick Tools Grid */}
      <section className="mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/toyota-forklift-serial-lookup" className="group bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Serial Number Lookup</h3>
          <p className="text-sm text-slate-600 mb-3">Identify your Toyota forklift's year, model, and specifications instantly.</p>
          <span className="text-red-600 font-semibold text-sm group-hover:underline">Use Tool →</span>
        </Link>

        <Link href="/diagnostic-codes/toyota-forklift-fault-codes" className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Fault Codes Database</h3>
          <p className="text-sm text-slate-600 mb-3">Searchable database of 40+ Toyota diagnostic codes with troubleshooting.</p>
          <span className="text-blue-600 font-semibold text-sm group-hover:underline">Browse Codes →</span>
        </Link>

        <Link href="/parts?brand=toyota" className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Toyota Parts Catalog</h3>
          <p className="text-sm text-slate-600 mb-3">Browse sensors, controllers, motors, and components for all Toyota models.</p>
          <span className="text-green-600 font-semibold text-sm group-hover:underline">Shop Parts →</span>
        </Link>

        <Link href="/quote" className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Support</h3>
          <p className="text-sm text-slate-600 mb-3">Get help from Toyota forklift specialists for complex issues.</p>
          <span className="text-purple-600 font-semibold text-sm group-hover:underline">Contact Us →</span>
        </Link>
      </section>

      {/* Popular Diagnostic Guides */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Diagnostic Guides</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Link href="/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2" className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-[#F76511] hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">E A5-1 Code: Speed Control Fault</h3>
                <p className="text-sm text-slate-600 mb-3">Complete troubleshooting guide for the common E A5-1 speed control system error.</p>
                <span className="text-[#F76511] font-semibold text-sm">View Full Guide →</span>
              </div>
            </div>
          </Link>

          <Link href="/diagnostic-codes/toyota-01-01-fuel-feedback-error" className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-[#F76511] hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⛽</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">01-01 Code: Fuel Feedback Error</h3>
                <p className="text-sm text-slate-600 mb-3">Fix fuel feedback control error (rich) on 4Y-ECS gasoline engines.</p>
                <span className="text-[#F76511] font-semibold text-sm">View Full Guide →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Service Areas */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Toyota Parts Available in Your Area</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900">New Mexico</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href="/new-mexico/albuquerque" className="text-[#F76511] hover:text-orange-600 font-semibold">
                  Toyota forklift parts in Albuquerque →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">Fast delivery to 87101-87124</span>
              </li>
              <li>
                <Link href="/new-mexico/las-cruces" className="text-[#F76511] hover:text-orange-600 font-semibold">
                  Toyota forklift parts in Las Cruces →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">Quick shipping to 88001-88012</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-3 text-slate-900">Colorado & Texas</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <Link href="/colorado/pueblo" className="text-[#F76511] hover:text-orange-600 font-semibold">
                  Toyota forklift parts in Pueblo →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">Same-day delivery available</span>
              </li>
              <li>
                <Link href="/texas/dallas-fort-worth" className="text-[#F76511] hover:text-orange-600 font-semibold">
                  Toyota forklift parts in Dallas-Fort Worth →
                </Link>
                <span className="text-sm text-slate-500 block mt-1">DFW Metroplex coverage</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Parts CTA */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Toyota Forklift Parts?</h2>
        <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
          From sensors to controllers, we stock precision-fit parts for all Toyota forklift models. Fast shipping nationwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/parts?brand=toyota" className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
            Browse Toyota Parts →
          </Link>
          <Link href="/quote" className="inline-flex items-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
            Request Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
