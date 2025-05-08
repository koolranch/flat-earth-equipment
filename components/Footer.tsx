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
      const response = await fetch('https://formspree.io/f/mrbqkjke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          _subject: 'New Email Signup'
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Flat Earth Equipment</div>
            <p className="text-slate-600">
              Flat Earth Equipment is built Western tough — precision-fit industrial parts, shipped nationwide.
            </p>
          </div>

          {/* Center Column - Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  Warranty
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-[#A0522D] transition-colors">
                  Privacy Policy
                </Link>
              </li>
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