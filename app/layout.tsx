import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CrispChat from '@/components/CrispChat';
import SupabaseProvider from './providers';
import { cookies } from 'next/headers';
import { I18nProvider } from '@/lib/i18n';
import SkipToContent from '@/components/a11y/SkipToContent';
import SkipLink from '@/components/a11y/SkipLink';
import LanguageSwitch from '@/components/i18n/LanguageSwitch';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';
import { Toaster } from 'react-hot-toast';
import QAEventListener from '@/components/dev/QAEventListener';

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
  // Get locale from cookies on the server
  const cookieLocale = cookies().get('locale')?.value;
  const envDefault = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'es' ? 'es' : 'en') as 'en' | 'es';
  const locale: 'en' | 'es' = (cookieLocale === 'es' || cookieLocale === 'en') ? cookieLocale : envDefault;
  
  return (
    <html lang={locale} className={inter.className}>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="O7ZIN2n38dDBmoeD1-7x92JUIMyo02CeMaPZMuoH7cE" />
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
          <I18nProvider locale={locale}>
            {/* A11y - Skip to main content link */}
            <SkipLink />
            <SkipToContent />
            
            {process.env.NODE_ENV !== 'production' ? <QAEventListener /> : null}
            
            {/* Global header with navigation and language switcher */}
            <header role="banner" className="border-b bg-white">
              <div className="container mx-auto p-4 flex items-center justify-between">
                <a href="/training" className="font-bold tracking-tight text-[#0F172A]">Flat Earth Safety</a>
                <nav aria-label="Global navigation" className="flex items-center gap-3">
                  <a className="text-sm underline hover:no-underline" href="/training">Training</a>
                  <a className="text-sm underline hover:no-underline" href="/records">Records</a>
                  <LanguageSwitch />
                </nav>
              </div>
            </header>
            
            {/* Main Navbar */}
            <Navbar locale={locale} />
            
            <main id="main-content" role="main">
              {children}
            </main>
            
            <Footer />
            <Analytics />
            <SpeedInsights />
            {/* Live chat widget */}
            <CrispChat />
            <Toaster />
          </I18nProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
} 