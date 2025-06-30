"use client";
import { useState } from 'react';
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Script from 'next/script';

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

function RaymondHelpForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    model: '',
    serial: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.usebasin.com/v1/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BASIN_API_KEY || 'fb0e195001565085399383d6996c0ab1'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: 'Raymond Forklift Serial Number Help Request',
          form_name: 'raymond_serial_help'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', model: '', serial: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <h3 className="text-xl font-semibold text-green-600 mb-2">✅ Help Request Sent!</h3>
        <p className="text-slate-600 mb-4">We'll get back to you soon with assistance.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-canyon-rust underline"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to send request. Please try again.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          disabled={status === 'loading'}
          autoComplete="name"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          disabled={status === 'loading'}
          autoComplete="email"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Raymond Model (e.g. R30, R40)"
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="serial"
          value={formData.serial}
          onChange={handleChange}
          placeholder="Serial Number (if known)"
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
      </div>

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Describe your forklift and where you've looked for the serial number. Include any photos if possible."
        rows={4}
        required
        disabled={status === 'loading'}
        className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Help Request'}
      </button>
    </form>
  );
}

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
          <RaymondHelpForm />
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