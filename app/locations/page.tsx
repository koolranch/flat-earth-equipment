import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rental Service Areas | Flat Earth Equipment",
  description: "Explore our regional equipment rental service areas across the Western U.S. Fast delivery, same-day quotes, and dispatch-ready gear near you.",
};

export default function LocationsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Rental Service Areas</h1>

      <p className="text-slate-700 mb-8">
        Flat Earth Equipment provides fast-dispatch rental coverage across the Western U.S. We don't operate walk-in storefronts — instead, our gear is staged near major job markets and ready to move. Browse our key service regions below:
      </p>

      <ul className="space-y-6">
        <li>
          <a href="/locations/cheyenne-wy" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Cheyenne, WY
          </a>
          <p className="text-slate-700 text-sm">Forklifts, scissor lifts, and job-site rentals available across southeastern Wyoming.</p>
        </li>

        <li>
          <a href="/locations/bozeman-mt" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Bozeman, MT
          </a>
          <p className="text-slate-700 text-sm">Serving construction and facilities from Belgrade to Big Sky with rugged rental gear.</p>
        </li>

        <li>
          <a href="/locations/pueblo-co" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Pueblo, CO
          </a>
          <p className="text-slate-700 text-sm">Supporting southern Colorado job sites with lifts, loaders, and forklifts ready to ship.</p>
        </li>

        <li>
          <a href="/locations/las-cruces-nm" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Las Cruces, NM
          </a>
          <p className="text-slate-700 text-sm">Dispatch-ready rentals across southern New Mexico, including boom lifts and mini loaders.</p>
        </li>
      </ul>

      <hr className="my-10" />

      <p className="text-xs text-slate-500">
        Flat Earth Equipment delivers rental equipment to these and other job sites from nearby regional hubs. No walk-in storefronts. Quotes and dispatch handled remotely.
      </p>
    </main>
  );
} 