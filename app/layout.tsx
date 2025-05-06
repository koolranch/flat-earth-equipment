import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
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
      <body className={inter.className}>{children}</body>
    </html>
  );
} 