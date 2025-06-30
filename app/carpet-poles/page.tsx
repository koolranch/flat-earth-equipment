"use client";
import { useState } from 'react';
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Shield, Truck, Package, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
  description: "High-quality forklift carpet poles for safe and efficient carpet handling. Custom sizes available. Get a quote for your carpet handling needs.",
  alternates: {
    canonical: "/carpet-poles",
  },
  openGraph: {
    title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
    description: "High-quality forklift carpet poles for safe and efficient carpet handling. Custom sizes available. Get a quote for your carpet handling needs.",
    url: "https://www.flatearthequipment.com/carpet-poles",
    type: "website",
  },
};

export default function CarpetPolesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Forklift Carpet Poles: Professional Carpet Handling Equipment
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Looking for reliable forklift carpet poles? Our heavy-duty carpet handling equipment is designed 
          for maximum safety and efficiency. Perfect for carpet warehouses, distribution centers, and 
          installation companies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Key Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-canyon-rust mt-1" />
                <span>Heavy-duty steel construction</span>
              </li>
              <li className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-canyon-rust mt-1" />
                <span>Compatible with all standard forklifts</span>
              </li>
              <li className="flex items-start gap-3">
                <Package className="w-5 h-5 text-canyon-rust mt-1" />
                <span>Custom lengths available</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-canyon-rust mt-1" />
                <span>OSHA-compliant safety features</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <ul className="space-y-3">
              <li><strong>Material:</strong> High-grade steel</li>
              <li><strong>Standard Lengths:</strong> 8', 10', 12', 14'</li>
              <li><strong>Load Capacity:</strong> Up to 2,000 lbs</li>
              <li><strong>Finish:</strong> Powder-coated for durability</li>
              <li><strong>Warranty:</strong> 1 year standard</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">Safety First</h3>
          <p className="text-yellow-700">
            Our forklift carpet poles are designed with safety as the top priority. Each pole features 
            reinforced construction and proper weight distribution to prevent accidents and ensure 
            secure carpet handling.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Request a Quote</h2>
          <CarpetPoleQuoteForm />
        </div>

        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Why Choose Our Forklift Carpet Poles?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Quality Construction</h3>
              <p className="text-slate-600 mt-1">
                Built with high-grade steel and precision engineering for maximum durability and safety.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Custom Solutions</h3>
              <p className="text-slate-600 mt-1">
                Available in various lengths and can be customized to meet your specific requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Safety Certified</h3>
              <p className="text-slate-600 mt-1">
                Meets all OSHA safety standards and includes proper weight distribution features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Expert Support</h3>
              <p className="text-slate-600 mt-1">
                Our team provides professional guidance on selection, installation, and maintenance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Need Help Choosing?</h3>
          <p className="mb-4">
            Our experts can help you select the right forklift carpet poles for your specific needs. 
            Contact us for personalized assistance and competitive pricing.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            Contact Our Experts
          </Link>
        </div>
      </div>
    </main>
  );
}

function CarpetPoleQuoteForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    forkWidth: '',
    carpetLength: '',
    carpetWeight: '',
    quantity: '',
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
          subject: 'Forklift Carpet Pole Quote Request',
          form_name: 'carpet_pole_quote'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          forkWidth: '',
          carpetLength: '',
          carpetWeight: '',
          quantity: '',
          message: ''
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">✅ Quote Request Received!</h2>
        <p className="text-slate-600 mb-4">We'll get back to you with a quote within 1 hour.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-canyon-rust underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to send request. Please try again.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="forkWidth" className="block text-sm font-medium text-slate-700 mb-1">
            Fork Width *
          </label>
          <select
            id="forkWidth"
            name="forkWidth"
            value={formData.forkWidth}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          >
            <option value="">Select width</option>
            <option value="4 inches">4 inches</option>
            <option value="5 inches">5 inches</option>
            <option value="5.5 inches">5.5 inches</option>
            <option value="6 inches">6 inches</option>
            <option value="7 inches">7 inches</option>
            <option value="Other">Other (specify in notes)</option>
          </select>
        </div>
        <div>
          <label htmlFor="carpetLength" className="block text-sm font-medium text-slate-700 mb-1">
            Carpet Roll Length
          </label>
          <input
            type="text"
            id="carpetLength"
            name="carpetLength"
            value={formData.carpetLength}
            onChange={handleChange}
            placeholder="e.g. 12 ft"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="carpetWeight" className="block text-sm font-medium text-slate-700 mb-1">
            Typical Weight
          </label>
          <input
            type="text"
            id="carpetWeight"
            name="carpetWeight"
            value={formData.carpetWeight}
            onChange={handleChange}
            placeholder="e.g. 200 lbs"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">
            Quantity Needed
          </label>
          <select
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          >
            <option value="">Select quantity</option>
            <option value="1 pair">1 pair</option>
            <option value="2 pairs">2 pairs</option>
            <option value="3+ pairs">3+ pairs</option>
            <option value="Bulk order">Bulk order (10+ pairs)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
          Additional Requirements
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          disabled={status === 'loading'}
          className="w-full px-4 py-2 border rounded-md focus:ring-canyon-rust focus:border-canyon-rust disabled:opacity-50"
          placeholder="Please specify any special requirements or questions..."
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Request Quote'}
        </button>
        <p className="text-sm text-slate-500">
          * Required fields
        </p>
      </div>
    </form>
  );
} 