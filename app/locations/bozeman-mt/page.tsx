import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Equipment Rentals Near Bozeman, MT | Flat Earth Equipment",
  description: "Flat Earth Equipment offers lift and construction rentals near Bozeman, MT. Fast quotes, reliable Western service, and job-site ready delivery.",
};

export default function BozemanLocationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Equipment Rentals Near Bozeman, MT
      </h1>

      <p className="text-slate-700 mb-6">
        Serving contractors, crews, and facilities across southwest Montana, Flat Earth Equipment offers fast-dispatch rentals for lifts, forklifts, and compact equipment near Bozeman. We don't operate a walk-in storefront — instead, we maintain rental inventory positioned for quick delivery to job sites in Gallatin County and beyond.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Available Rentals</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Rough-Terrain Scissor Lifts</li>
          <li>Warehouse Forklifts (Electric, LP)</li>
          <li>Compact Track Loaders</li>
          <li>Telehandlers & Boom Lifts</li>
          <li>Dingo-Style Mini Loaders</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Brands We Support</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Bobcat</li>
          <li>Skyjack</li>
          <li>Genie</li>
          <li>JCB</li>
          <li>Kubota</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Serving Bozeman & Southwest Montana</h2>
        <p className="text-slate-700">
          From Belgrade to Livingston and Big Sky, we support projects throughout the region. Expect same-day quote turnaround, clean condition equipment, and Western-tough customer service.
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
        Flat Earth Equipment does not operate a physical storefront in Bozeman. Equipment is stored in our regional rental network and delivered to your job site or yard.
      </p>

      <div className="mt-12 text-sm text-slate-600">
        <p>Serving Bozeman, Belgrade, Livingston, Three Forks, Big Sky & nearby towns.</p>
        <p className="mt-1">
          Questions? <a href="/contact" className="text-canyon-rust underline">Contact our team</a> or call (307) 302-0043.
        </p>
      </div>
    </main>
  );
} 