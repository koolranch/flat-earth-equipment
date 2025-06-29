import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "John Deere PIN Lookup Guide | Find Your Skid Steer Model & Parts | Flat Earth Equipment",
  description: "Learn how to find and decode your John Deere skid steer PIN (Product Identification Number). Complete guide to model identification, parts lookup, and maintenance history.",
  alternates: {
    canonical: "/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup",
  },
  openGraph: {
    title: "John Deere PIN Lookup Guide | Find Your Skid Steer Model & Parts | Flat Earth Equipment",
    description: "Learn how to find and decode your John Deere skid steer PIN (Product Identification Number). Complete guide to model identification, parts lookup, and maintenance history.",
    url: "https://www.flatearthequipment.com/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup",
    type: "website",
  },
};

export default function JohnDeerePINLookupPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        John Deere PIN Lookup Guide for Skid Steers
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Need to find your John Deere skid steer's PIN (Product Identification Number)? This comprehensive guide will help you locate and decode your equipment's PIN, 
          ensuring you get the right parts and service for your John Deere skid steer.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Where to Find Your John Deere PIN</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Search className="w-6 h-6 text-canyon-rust" />
              </div>
              <div>
                <h3 className="font-semibold">Common PIN Locations</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>On the frame near the left front wheel</li>
                  <li>Under the operator's platform</li>
                  <li>On the right side of the frame</li>
                  <li>Behind the operator's seat</li>
                  <li>On the engine block (for engine-specific parts)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Understanding John Deere PIN Numbers</h2>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">PIN Format</h3>
              <p className="mb-4">
                John Deere skid steer PIN numbers typically follow this format:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <code className="text-sm">[Model Code][Year][Production Number]</code>
              </div>
              <p className="text-sm text-slate-600">
                Example: 320D-2023-12345 (320D model, 2023 year, unit #12345)
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
                <p className="text-sm text-yellow-700">
                  The PIN is different from the serial number. The PIN is used for parts identification and service, 
                  while the serial number is used for warranty and ownership purposes.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Why PIN Numbers Matter</h2>
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
          <h3 className="text-xl font-semibold mb-4">Need Help Finding Your PIN?</h3>
          <form
            method="POST"
            action="https://usebasin.com/f/YOUR_BASIN_FORM_ID"
            className="space-y-4"
          >
            <input type="hidden" name="subject" value="John Deere Skid Steer PIN Help Request" />
            <input type="hidden" name="form_name" value="john_deere_pin_help" />
            
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
                placeholder="John Deere Model (e.g. 320D, 332G)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
              <input
                name="pin"
                placeholder="PIN Number (if known)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
            </div>

            <textarea
              name="message"
              placeholder="Describe your skid steer and where you've looked for the PIN. Include any photos if possible."
              rows={4}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded"
            />

            <button
              type="submit"
              className="w-full bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
            >
              Get Help Finding PIN
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
              <Link href="/parts/construction-equipment-parts/john-deere" className="text-blue-600 hover:underline">
                John Deere Skid Steer Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/skid-steers/john-deere" className="text-blue-600 hover:underline">
                John Deere Skid Steer Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/construction-equipment-maintenance" className="text-blue-600 hover:underline">
                Skid Steer Maintenance Services
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">What's the difference between a PIN and serial number?</h3>
              <p className="text-slate-600 mt-1">
                The PIN (Product Identification Number) is used for parts identification and service, while the serial number is used for warranty and ownership purposes. Both are important for different reasons.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I decode my John Deere PIN?</h3>
              <p className="text-slate-600 mt-1">
                John Deere PINs typically include the model code, year of manufacture, and production number. Our team can help decode your specific PIN and identify the correct parts for your equipment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What if I can't find my PIN?</h3>
              <p className="text-slate-600 mt-1">
                If you can't locate your PIN, contact our support team using the form above. We can help identify your skid steer model and locate the PIN using other identifying features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Why do I need my PIN for parts?</h3>
              <p className="text-slate-600 mt-1">
                The PIN helps ensure you get the correct parts for your specific skid steer model and year. This prevents ordering incompatible parts and ensures proper fitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 