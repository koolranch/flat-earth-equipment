import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flat Earth Equipment',
  description: 'Quality equipment from a flat world',
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
        <Footer />
      </body>
    </html>
  );
} 