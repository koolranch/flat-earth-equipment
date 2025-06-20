import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CrispChat from '@/components/CrispChat';
import SupabaseProvider from './providers';
import { getUserLocale } from '@/lib/getUserLocale';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More",
  description: "Flat Earth Equipment delivers precision-fit industrial parts and rugged rental equipment — with same-day shipping across the Western U.S.",
};

// Client component to conditionally show trust badges
function ConditionalTrustBadges() {
  'use client';
  
  const [pathname, setPathname] = React.useState('');
  
  React.useEffect(() => {
    setPathname(window.location.pathname);
  }, []);
  
  // Hide on charger-modules page to avoid duplication
  if (pathname.includes('/charger-modules')) {
    return null;
  }
  
  return (
    <section className="bg-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-sm text-slate-700 text-center">
        <span className="bg-white rounded-md px-4 py-2 shadow-sm">🚚 Same-Day Dispatch</span>
        <span className="bg-white rounded-md px-4 py-2 shadow-sm">📦 Parts Shipped Nationwide</span>
        <span className="bg-white rounded-md px-4 py-2 shadow-sm">📍 Western U.S. Focus</span>
        <span className="bg-white rounded-md px-4 py-2 shadow-sm">🤝 U.S.-Based Support</span>
      </div>
    </section>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale from cookies on the server
  const locale = getUserLocale();
  
  return (
    <html lang={locale} className={inter.className}>
      <head>
        <link rel="preconnect" href="https://stream.mux.com" />
        {/* SEO: Canonical URL to avoid duplicate content */}
        <link rel="canonical" href="https://www.flatearthequipment.com" />
        {/* SEO: hreflang tags for international SEO */}
        <link rel="alternate" hrefLang="en" href="https://www.flatearthequipment.com" />
        <link rel="alternate" hrefLang="es" href="https://www.flatearthequipment.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.flatearthequipment.com" />
      </head>
      <body className="font-sans text-gray-900 bg-gray-50 antialiased">
        <SupabaseProvider>
          {/* Navbar now receives locale */}
          <Navbar locale={locale} />
          {children}
          <ConditionalTrustBadges />
          <Footer />
          <Analytics />
          <SpeedInsights />
          {/* Live chat widget */}
          <CrispChat />
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
} 