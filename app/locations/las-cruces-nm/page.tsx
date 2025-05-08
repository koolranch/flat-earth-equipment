import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Equipment Rentals Near Las Cruces, NM | Flat Earth Equipment",
  description: "Flat Earth Equipment serves Las Cruces, NM with fast quotes on forklifts, scissor lifts, and more. Dispatch-ready equipment delivered to your job site.",
};

export default function LasCrucesLocationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Equipment Rentals Near Las Cruces, NM
      </h1>

      <p className="text-slate-700 mb-6">
        Flat Earth Equipment provides rugged, job-site ready rentals to contractors and facility operators throughout southern New Mexico. While we don't have a storefront in Las Cruces, our regional inventory is staged for fast delivery — with same-day quotes available for most equipment types.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Rental Equipment Available</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Electric and LP Forklifts</li>
          <li>Compact Skid Steers</li>
          <li>Scissor & Boom Lifts</li>
          <li>Telehandlers (All Sizes)</li>
          <li>Mini Loaders & Utility Equipment</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Supported Brands</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Toyota</li>
          <li>Genie</li>
          <li>SkyTrak</li>
          <li>Enersys</li>
          <li>JLG</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Serving Southern New Mexico</h2>
        <p className="text-slate-700">
          From Mesilla to Alamogordo and Deming, we cover job sites across the region with reliable rental dispatch and flexible terms. Our team specializes in supporting remote and rural operations with fleet-grade equipment.
        </p>
      </section>

      <div className="mt-8">
        <a
          href="/quote"
          className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
        >
          Request a Rental Quote
        </a>
      </div>

      <hr className="my-10" />

      <p className="text-xs text-slate-500">
        Flat Earth Equipment does not operate a walk-in location in Las Cruces. All equipment is dispatched from regional hubs and delivered directly to your job site.
      </p>

      <div className="mt-12 text-sm text-slate-600">
        <p>Serving Las Cruces, Mesilla, Deming, Alamogordo, and surrounding towns.</p>
        <p className="mt-1">
          Need help? <a href="/contact" className="text-canyon-rust underline">Contact our support team</a> or call (307) 302-0043.
        </p>
      </div>
    </main>
  );
} 