import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Flat Earth Equipment | Flat Earth Equipment',
  description: 'Learn about Flat Earth Equipment, your trusted partner for industrial equipment parts and rentals.',
  alternates: { canonical: '/about' }
};

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-teko text-slate-900 mb-6">
        Built Western Tough. Driven by Precision.
      </h1>

      <p className="text-lg text-slate-700 mb-10 max-w-2xl">
        Flat Earth Equipment was built to serve the real operators — the mechanics, the parts managers, the fleet supervisors keeping America's equipment moving. We don't waste time, and we don't cut corners.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">What We Do</h2>
        <p className="text-slate-700 mb-4">
          We supply precision-fit replacement parts for forklifts, scissor lifts, aerial equipment, and construction machines. Whether you're managing a municipal fleet or a rental yard in Wyoming, we get you the part — fast.
        </p>
        <p className="text-slate-700">
          Our team specializes in parts compatibility, sourcing, and speed. We ship anywhere in the U.S., but our brand runs on Western grit — from oil rigs in New Mexico to warehouses in Montana.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">How We Operate</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Parts in stock and ready to ship</li>
          <li>Same-day quotes with no middleman delays</li>
          <li>Transparent pricing and responsive support</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Who We Serve</h2>
        <p className="text-slate-700 mb-4">
          We support construction fleets, independent technicians, public works departments, rental companies, and shop managers who don't have time to guess.
        </p>
        <p className="text-slate-700">
          Our buyers are professionals who need fast quotes, precision parts, and honest info. That's what we deliver.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Where We Come From</h2>
        <p className="text-slate-700">
          Our roots are in the rugged West — where downtime isn't an option and performance matters. That mindset drives everything we do, from part sourcing to packaging.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Explore More</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/parts"
            className="inline-block bg-[#A0522D] text-white px-6 py-3 rounded-md text-center hover:bg-[#8B4513] transition"
          >
            Browse All Parts
          </Link>
          <Link
            href="/brands"
            className="inline-block border border-[#A0522D] text-[#A0522D] px-6 py-3 rounded-md text-center hover:bg-[#A0522D] hover:text-white transition"
          >
            Shop by Brand
          </Link>
        </div>
      </section>

      <footer className="text-sm text-slate-500 border-t pt-6">
        Last updated: May 2024
      </footer>
    </main>
  );
} 