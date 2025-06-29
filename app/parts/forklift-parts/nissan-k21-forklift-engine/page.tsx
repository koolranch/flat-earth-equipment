import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search, Wrench, Settings, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: "Nissan K21 Forklift Engine Guide | Flat Earth Equipment",
  description: "Complete guide to the Nissan K21 forklift engine. Learn about specifications, maintenance, common issues, and replacement parts.",
  alternates: {
    canonical: "/parts/forklift-parts/nissan-k21-forklift-engine",
  },
};

export default function NissanK21EnginePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Nissan K21 Forklift Engine Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          The Nissan K21 is a reliable and efficient engine commonly found in Nissan forklifts. 
          This guide provides comprehensive information about the engine's specifications, maintenance requirements, 
          and common issues.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Engine Specifications</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Engine Type: 4-cylinder, water-cooled</li>
            <li>Displacement: 2.1L (2,068 cc)</li>
            <li>Power Output: 45-50 HP</li>
            <li>Fuel Type: LPG/Propane</li>
            <li>Cooling System: Liquid-cooled</li>
            <li>Bore x Stroke: 85mm x 91mm</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Common Applications</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nissan FD30 Forklift</li>
              <li>Nissan FD40 Forklift</li>
              <li>Nissan FD50 Forklift</li>
              <li>Nissan FD60 Forklift</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Maintenance Schedule</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Daily Checks</h3>
                <ul className="list-disc pl-6">
                  <li>Check engine oil level</li>
                  <li>Inspect coolant level</li>
                  <li>Check for leaks</li>
                  <li>Listen for unusual noises</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Every 250 Hours</h3>
                <ul className="list-disc pl-6">
                  <li>Change engine oil and filter</li>
                  <li>Check and adjust valve clearance</li>
                  <li>Inspect spark plugs</li>
                  <li>Check ignition timing</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Every 500 Hours</h3>
                <ul className="list-disc pl-6">
                  <li>Replace air filter</li>
                  <li>Change fuel filter</li>
                  <li>Check and adjust carburetor</li>
                  <li>Inspect cooling system</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Common Issues and Solutions</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Hard Starting</h3>
                <ul className="list-disc pl-6">
                  <li>Check spark plugs and ignition system</li>
                  <li>Verify fuel pressure and delivery</li>
                  <li>Inspect carburetor for proper adjustment</li>
                  <li>Check battery condition and connections</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Overheating</h3>
                <ul className="list-disc pl-6">
                  <li>Check coolant level and condition</li>
                  <li>Inspect radiator and cooling system</li>
                  <li>Verify thermostat operation</li>
                  <li>Check water pump function</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Loss of Power</h3>
                <ul className="list-disc pl-6">
                  <li>Check air filter condition</li>
                  <li>Inspect fuel system components</li>
                  <li>Verify valve adjustment</li>
                  <li>Check compression levels</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Request a Quote for Nissan K21 Engine Parts</h3>
          <form
            method="POST"
            action="https://usebasin.com/f/YOUR_BASIN_FORM_ID"
            className="space-y-4"
          >
                          <input type="hidden" name="subject" value="Nissan K21 Engine Quote Request" />
              <input type="hidden" name="form_name" value="nissan_k21_quote" />
            
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
                placeholder="Forklift Model (e.g. FD30)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
              <input
                name="serial"
                placeholder="Serial Number (optional)"
                className="w-full border border-slate-300 px-4 py-2 rounded"
              />
            </div>

            <textarea
              name="message"
              placeholder="What parts or service do you need? Include any specific details about your K21 engine."
              rows={4}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded"
            />

            <button
              type="submit"
              className="w-full bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
            >
              Request Quote
            </button>

            <p className="text-sm text-slate-600 mt-2">
              🚚 Same-day dispatch • 📦 Parts Shipped Nationwide • 🤝 U.S.-Based Support
            </p>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <ul className="list-disc pl-6">
            <li>
              <Link href="/parts/forklift-parts/nissan" className="text-blue-600 hover:underline">
                Nissan Forklift Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/forklifts/nissan" className="text-blue-600 hover:underline">
                Nissan Forklift Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/forklift-maintenance" className="text-blue-600 hover:underline">
                Forklift Maintenance Services
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
} 