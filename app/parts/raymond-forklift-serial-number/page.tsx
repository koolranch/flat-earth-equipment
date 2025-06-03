import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Raymond Forklift Serial Number Lookup Guide | Flat Earth Equipment",
  description: "Find your Raymond forklift serial number location and decode it. Complete guide to Raymond forklift model identification, parts lookup, and maintenance history.",
  alternates: {
    canonical: "/parts/raymond-forklift-serial-number",
  },
  openGraph: {
    title: "Raymond Forklift Serial Number Lookup Guide | Flat Earth Equipment",
    description: "Find your Raymond forklift serial number location and decode it. Complete guide to Raymond forklift model identification, parts lookup, and maintenance history.",
    url: "https://www.flatearthequipment.com/parts/raymond-forklift-serial-number",
    type: "website",
  },
};

export default function RaymondSerialNumberPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Raymond Forklift Serial Number Lookup Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Need to find your Raymond forklift serial number? This comprehensive guide will help you locate and decode your Raymond forklift's serial number, 
          ensuring you get the right parts and service for your equipment.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Where to Find Your Raymond Forklift Serial Number</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Search className="w-6 h-6 text-canyon-rust" />
              </div>
              <div>
                <h3 className="font-semibold">Common Locations</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Under the hood on the frame rail</li>
                  <li>On the right side of the mast</li>
                  <li>On the data plate near the operator's compartment</li>
                  <li>On the frame near the front wheels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Understanding Raymond Serial Numbers</h2>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Serial Number Format</h3>
              <p className="mb-4">
                Raymond forklift serial numbers typically follow this format:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <code className="text-sm">[Model Code][Year][Production Number]</code>
              </div>
              <p className="text-sm text-slate-600">
                Example: R30-2023-12345 (R30 model, 2023 year, unit #12345)
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Why Serial Numbers Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Parts Compatibility</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ensure correct part fitment</li>
                  <li>Identify model-specific components</li>
                  <li>Access accurate parts diagrams</li>
                  <li>Prevent ordering incorrect parts</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Service & Maintenance</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Track maintenance history</li>
                  <li>Access service manuals</li>
                  <li>Identify recall information</li>
                  <li>Schedule preventive maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Need Help Finding Your Serial Number?</h3>
          <form
            method="POST"
            action="https://formspree.io/f/xvgroloy"
            className="space-y-4"
          >
            <input type="hidden" name="_subject" value="Raymond Forklift Serial Number Help Request" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Your Name"
                required
                autoComplete="name"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                autoComplete="email"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="model"
                placeholder="Raymond Model (e.g. R30, R40)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
              <input
                name="serial"
                placeholder="Serial Number (if known)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
            </div>

            <textarea
              name="message"
              placeholder="Describe your forklift and where you've looked for the serial number. Include any photos if possible."
              rows={4}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded"
            />

            <button
              type="submit"
              className="w-full bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
            >
              Get Help Finding Serial Number
            </button>

            <p className="text-sm text-slate-600 mt-2">
              🚚 Same-day response • 📦 Parts Shipped Nationwide • 🤝 U.S.-Based Support
            </p>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Link href="/parts/raymond" className="text-blue-600 hover:underline">
                Raymond Forklift Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/forklifts/raymond" className="text-blue-600 hover:underline">
                Raymond Forklift Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/forklift-maintenance" className="text-blue-600 hover:underline">
                Forklift Maintenance Services
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">What if I can't find my serial number?</h3>
              <p className="text-slate-600 mt-1">
                If you can't locate your serial number, contact our support team using the form above. We can help identify your forklift model and locate the serial number.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I decode my Raymond serial number?</h3>
              <p className="text-slate-600 mt-1">
                Raymond serial numbers typically include the model code, year of manufacture, and production number. Our team can help decode your specific serial number.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Why do I need my serial number for parts?</h3>
              <p className="text-slate-600 mt-1">
                The serial number helps ensure you get the correct parts for your specific forklift model and year. This prevents ordering incompatible parts and ensures proper fitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 