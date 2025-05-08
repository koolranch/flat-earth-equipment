import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Equipment Rentals Near Pueblo, CO | Flat Earth Equipment",
  description: "Get fast rental quotes for forklifts, lifts, and compact equipment in Pueblo, Colorado. Flat Earth Equipment serves southern Colorado job sites with rugged gear and fast delivery.",
};

export default function PuebloLocationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Equipment Rentals Near Pueblo, CO
      </h1>

      <p className="text-slate-700 mb-6">
        Flat Earth Equipment proudly supports job sites across southern Colorado. While we don't operate a physical storefront in Pueblo, our rental inventory is staged nearby and ready for dispatch — including lifts, forklifts, and compact equipment tailored for construction, facility, and municipal use.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Rental Equipment Available</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Warehouse & Yard Forklifts</li>
          <li>Telescopic Boom Lifts</li>
          <li>Indoor/Outdoor Scissor Lifts</li>
          <li>Skid Steers & Attachments</li>
          <li>Mini Excavators</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Supported Brands</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>JLG</li>
          <li>Genie</li>
          <li>Doosan</li>
          <li>Hyundai</li>
          <li>Clark</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Delivery to Pueblo & Southern Colorado</h2>
        <p className="text-slate-700">
          From Pueblo West to Canon City and Trinidad, we deliver fast. Expect same-day quotes, responsive communication, and ready-to-run equipment from Flat Earth Equipment.
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
        Flat Earth Equipment does not operate a physical storefront in Pueblo. All rentals are dispatched from regional hubs and delivered to your site.
      </p>

      <div className="mt-12 text-sm text-slate-600">
        <p>Serving Pueblo, Canon City, Trinidad, Pueblo West, Walsenburg, and nearby towns.</p>
        <p className="mt-1">
          Questions? <a href="/contact" className="text-canyon-rust underline">Contact us</a> or call (307) 302-0043.
        </p>
      </div>
    </main>
  );
} 