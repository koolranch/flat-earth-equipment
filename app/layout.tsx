import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More",
  description: "Flat Earth Equipment delivers precision-fit industrial parts and rugged rental equipment — with same-day shipping across the Western U.S.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans text-gray-900 bg-gray-50 antialiased`}>
        <Navbar />
        {children}
        <section className="bg-slate-100 py-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-sm text-slate-700 text-center">
            <span className="bg-white rounded-md px-4 py-2 shadow-sm">🚚 Same-Day Dispatch</span>
            <span className="bg-white rounded-md px-4 py-2 shadow-sm">📦 Parts Shipped Nationwide</span>
            <span className="bg-white rounded-md px-4 py-2 shadow-sm">📍 Western U.S. Focus</span>
            <span className="bg-white rounded-md px-4 py-2 shadow-sm">🤝 U.S.-Based Support</span>
          </div>
        </section>
        <Footer />
      </body>
    </html>
  );
} 