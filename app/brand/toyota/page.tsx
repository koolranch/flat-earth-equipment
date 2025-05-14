import Link from 'next/link';

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