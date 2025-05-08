import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Equipment Rentals Near Cheyenne, WY | Flat Earth Equipment",
  description: "Need forklift or aerial equipment near Cheyenne, WY? Flat Earth Equipment offers fast quotes and job-site ready rentals backed by Western-tough service.",
};

export default function CheyenneLocationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Equipment Rentals Near Cheyenne, WY
      </h1>

      <p className="text-slate-700 mb-6">
        Flat Earth Equipment proudly serves job sites across southeastern Wyoming. While we don't operate a physical storefront in Cheyenne, we maintain dispatch-ready rental inventory nearby — including forklifts, scissor lifts, skid steers, and telehandlers — backed by fast quotes and responsive support.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Available Rentals</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Electric & LP Forklifts</li>
          <li>Scissor Lifts (Indoor/Outdoor)</li>
          <li>Telescopic Boom Lifts</li>
          <li>Skid Steers & Mini Loaders</li>
          <li>Telehandlers (6K–10K lb)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Trusted Brands We Support</h2>
        <p className="text-slate-700 mb-2">
          We rent and service parts compatible with:
        </p>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>Genie</li>
          <li>JLG</li>
          <li>Skyjack</li>
          <li>Doosan</li>
          <li>Caterpillar</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Fast Delivery to Cheyenne Job Sites</h2>
        <p className="text-slate-700">
          Whether you're staging equipment for a commercial build or need a last-minute lift replacement, we offer fast turnaround from our Western network. Most rentals can be quoted and dispatched same-day.
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
        Flat Earth Equipment does not maintain a retail storefront in Cheyenne, WY. All rental services are dispatched from nearby locations and delivered to your job site.
      </p>

      <div className="mt-12 text-sm text-slate-600">
        <p>Serving Cheyenne, Laramie, Torrington, Pine Bluffs & surrounding areas.</p>
        <p className="mt-1">
          Questions? <a href="/contact" className="text-canyon-rust underline">Contact our team</a> or call (307) 302-0043.
        </p>
      </div>
    </main>
  );
} 