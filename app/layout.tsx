import '../sentry.client.config';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import { seoDefaults } from './seo-defaults';
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
import ReducedMotionProvider from '@/components/a11y/ReducedMotionProvider';
import ReducedMotionToggle from '@/components/a11y/ReducedMotionToggle';
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher';
import { getUserLocale } from '@/lib/getUserLocale';
import { getAdminStatus } from '@/lib/admin/guard';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';
import { Toaster } from 'react-hot-toast';
import QAEventListener from '@/components/dev/QAEventListener';
import SafetyTopbar from '@/components/safety/SafetyTopbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  ...seoDefaults,
  // Override with existing specific metadata
  title: "Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More",
  description: "Flat Earth Equipment delivers precision-fit industrial parts and rugged rental equipment — with same-day shipping across the Western U.S.",
};



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get active locale from cookie with fallback (safe for static generation)
  const locale = getUserLocale();
  
  // Check admin status for conditional header link (safe for static generation)
  const adminStatus = await getAdminStatus();
  
  return (
    <html lang={locale} className={inter.className}>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="O7ZIN2n38dDBmoeD1-7x92JUIMyo02CeMaPZMuoH7cE" />
        
        {/* Perf: preconnect/dns-prefetch to Supabase and Mux (if used) */}
        <link rel="preconnect" href="https://mzsozezflbhebykncbmr.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//mzsozezflbhebykncbmr.supabase.co" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//image.mux.com" />
        <link rel="preconnect" href="https://stream.mux.com" />
        
        {/* SEO: Canonical URL to avoid duplicate content */}
        <link rel="canonical" href="https://www.flatearthequipment.com" />
        {/* SEO: hreflang tags for international SEO */}
        <link rel="alternate" hrefLang="en" href="https://www.flatearthequipment.com" />
        <link rel="alternate" hrefLang="es" href="https://www.flatearthequipment.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.flatearthequipment.com" />
        {/* Client-side error monitoring */}
        <script src="/monitor.js" async />
        
        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/app-icon-192.png" />
      </head>
      <body className="font-sans text-gray-900 bg-gray-50 antialiased">
        <ReducedMotionProvider>
          <SupabaseProvider>
            <I18nProvider>
            {/* A11y - Skip to main content link */}
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-xl">Skip to main content</a>
            <SkipLink />
            <SkipToContent />
            
            {process.env.NODE_ENV !== 'production' ? <QAEventListener /> : null}
            
            {/* Safety sub-nav moved to components/safety/SafetyTopbar.tsx */}
            {/* Render the gated safety/training micro header ONLY on training routes */}
            <SafetyTopbar />
            
            {/* Main Navbar */}
            <Navbar locale={locale} />
            
            <main id="main" role="main">
              {children}
            </main>
            
            <Footer />
            
            {/* Footer with legal links and accessibility toggle */}
            <footer role="contentinfo" className="mt-10 border-t text-xs text-slate-500 bg-white">
              <div className="container mx-auto p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span>© Flat Earth Safety</span>
                  <nav aria-label="Legal and support links" className="flex gap-4">
                    <a href="/legal/terms" className="hover:text-slate-700 underline hover:no-underline">Terms</a>
                    <a href="/legal/privacy" className="hover:text-slate-700 underline hover:no-underline">Privacy</a>
                    <a href="/contact" className="hover:text-slate-700 underline hover:no-underline">Contact</a>
                  </nav>
                </div>
                <ReducedMotionToggle />
              </div>
            </footer>
            <Analytics />
            <SpeedInsights />
            {/* Live chat widget */}
            <CrispChat />
            <Toaster />
            </I18nProvider>
          </SupabaseProvider>
        </ReducedMotionProvider>
      </body>
    </html>
  );
} 