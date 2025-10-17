'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
          email,
          subject: 'New Email Signup',
          form_name: 'footer_signup'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-[#F9F7F3] text-[#2D2D2D]">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column - Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Flat Earth Equipment</div>
            <p className="text-slate-600 text-sm">
              Flat Earth Equipment is built Western tough — precision-fit industrial parts and dispatch-ready rentals, shipped nationwide.
            </p>
          </div>

          {/* Center Column - Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/insights" className="hover:text-canyon-rust transition">Insights & Guides</Link></li>
              <li><Link href="/about" className="hover:text-canyon-rust transition">About Us</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-canyon-rust transition">Shipping & Returns</Link></li>
              <li><Link href="/warranty" className="hover:text-canyon-rust transition">Warranty</Link></li>
              <li><Link href="/contact" className="hover:text-canyon-rust transition">Contact</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-canyon-rust transition">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-canyon-rust transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Service Areas Column */}
          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/locations" className="hover:text-canyon-rust transition">Service Areas</Link>
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/texas/dallas-fort-worth" className="hover:text-canyon-rust transition">Dallas-Fort Worth, TX</Link></li>
              <li><Link href="/texas/el-paso" className="hover:text-canyon-rust transition">El Paso, TX</Link></li>
              <li><Link href="/arizona/phoenix" className="hover:text-canyon-rust transition">Phoenix, AZ</Link></li>
              <li><Link href="/colorado/denver" className="hover:text-canyon-rust transition">Denver, CO</Link></li>
              <li><Link href="/colorado/pueblo" className="hover:text-canyon-rust transition">Pueblo, CO</Link></li>
              <li><Link href="/new-mexico/albuquerque" className="hover:text-canyon-rust transition">Albuquerque, NM</Link></li>
              <li><Link href="/new-mexico/las-cruces" className="hover:text-canyon-rust transition">Las Cruces, NM</Link></li>
              <li><Link href="/montana/bozeman" className="hover:text-canyon-rust transition">Bozeman, MT</Link></li>
              <li><Link href="/wyoming/cheyenne" className="hover:text-canyon-rust transition">Cheyenne, WY</Link></li>
            </ul>
          </div>

          {/* Right Column - Email Signup */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                autoComplete="email"
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A0522D]/20"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-2 bg-[#A0522D] text-white rounded-lg hover:bg-[#A0522D]/90 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            {status === 'success' && (
              <p className="mt-2 text-sm text-green-600">Thanks for signing up!</p>
            )}
            {status === 'error' && (
              <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>

        {/* Base Bar - Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-slate-600 text-center md:text-left">
            © {new Date().getFullYear()} Flat Earth Equipment. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 