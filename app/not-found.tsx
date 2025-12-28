'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Wrench, FileText, Phone, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/insights?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl w-full text-center space-y-10">
        {/* 404 Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-canyon-rust/20 text-canyon-rust px-4 py-2 rounded-full text-sm font-semibold">
            <span>🔍</span> Page Not Found
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Looking for a specific <span className="text-canyon-rust">part or manual</span>?
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We can help. Search our catalog or browse our most popular resources below.
          </p>
        </div>

        {/* Search Bar - Central Focus */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for parts, manuals, or guides..."
              className="w-full pl-12 pr-32 py-4 bg-white rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-canyon-rust/30 shadow-xl text-lg"
              aria-label="Search for parts, manuals, or guides"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-canyon-rust hover:bg-canyon-rust/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Links - High Visibility CTAs */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link
            href="/parts"
            className="group flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:border-canyon-rust/50 transition-all"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">Browse Parts</div>
              <div className="text-sm text-slate-400">Forklift, Scissor Lift & More</div>
            </div>
          </Link>
          
          <Link
            href="/parts/toyota-forklift-manuals"
            className="group flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:border-canyon-rust/50 transition-all"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-green-500/20 text-green-400 rounded-xl group-hover:bg-green-500/30 transition-colors">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">Download Manuals</div>
              <div className="text-sm text-slate-400">Toyota Forklift PDFs</div>
            </div>
          </Link>
          
          <a
            href="tel:+1-888-392-9175"
            className="group flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:border-canyon-rust/50 transition-all"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-canyon-rust/20 text-canyon-rust rounded-xl group-hover:bg-canyon-rust/30 transition-colors">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">Call for Support</div>
              <div className="text-sm text-slate-400">(888) 392-9175</div>
            </div>
          </a>
        </div>

        {/* Back to Homepage */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>

        {/* Subtle Branding */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500">
            Flat Earth Equipment — Parts & Rentals for Forklifts, Scissor Lifts & More
          </p>
        </div>
      </div>
    </main>
  );
}
