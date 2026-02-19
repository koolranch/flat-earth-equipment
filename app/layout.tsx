import '../sentry.client.config';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import Script from 'next/script';
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
import '../styles/safety-subnav.css';
import '../styles/training-polish.css';
import '../styles/training-overrides.css';
import '../styles/training-click-fix.css';
import { Toaster } from 'react-hot-toast';
import QAEventListener from '@/components/dev/QAEventListener';
import SafetyRouteGate from '@/components/safety/SafetyRouteGate';
import PerformanceMonitor from '@/components/PerformanceMonitor';

const inter = Inter({ subsets: ['latin'] });

// CANONICAL DOMAIN: Force all stray backlink authority to www version
const CANONICAL_DOMAIN = 'https://www.flatearthequipment.com';

export const metadata: Metadata = {
  ...seoDefaults,
  // Force canonical base URL to www domain for all pages
  metadataBase: new URL(CANONICAL_DOMAIN),
  // Override with existing specific metadata
  title: "Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More",
  description: "Flat Earth Equipment delivers precision-fit industrial parts and rugged rental equipment — with same-day shipping across the Western U.S.",
  // NOTE: Do NOT set global alternates.languages here!
  // Pages inherit this and get incorrect hreflang pointing to homepage.
  // Each page should set its own alternates.languages if it has translations.
  // The metadataBase above ensures all relative canonicals become absolute www URLs.
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
    other: [{ rel: "mask-icon", url: "/favicon.svg", color: "#F76511" }],
  },
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
        
        {/* Pinterest Domain Verification */}
        <meta name="p:domain_verify" content="31d2150c1d8a86c95b938c37f0838eff" />
        
        {/* Google Analytics 4 + Google Ads — using next/script for proper loading */}
        
        {/* Perf: preconnect/dns-prefetch to Supabase and Mux (if used) */}
        <link rel="preconnect" href="https://mzsozezflbhebykncbmr.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//mzsozezflbhebykncbmr.supabase.co" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//image.mux.com" />
        <link rel="preconnect" href="https://stream.mux.com" />
        
        {/* Perf: Stripe and Google Fonts for checkout */}
        <link rel="preconnect" href="https://js.stripe.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* SEO: hreflang tags are set per-page via generateMetadata() */}
        {/* Do NOT add global hreflang here - it causes "more than one page for same language" errors */}
        
        {/* Client-side error monitoring */}
        <script src="/monitor.js" async />
        
        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/app-icon-192.png" />
      </head>
      <body className="font-sans text-gray-900 bg-gray-50 antialiased">
        {/* Google Analytics 4 + Google Ads global site tag */}
        {(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3MQWE0RK5M') && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3MQWE0RK5M'}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3MQWE0RK5M'}', {
                  page_path: window.location.pathname,
                });
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16989996368'}');
              `}
            </Script>
          </>
        )}
        <ReducedMotionProvider>
          <SupabaseProvider>
            <I18nProvider>
            {/* A11y - Skip to main content link */}
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-xl">Skip to main content</a>
            <SkipLink />
            <SkipToContent />
            
            {process.env.NODE_ENV !== 'production' ? <QAEventListener /> : null}
            
            {/* Main Navbar */}
            <Navbar locale={locale} />
            
            {/* Safety sub-nav appears BELOW main navbar on training/safety routes only */}
            <SafetyRouteGate />
            
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
            {/* Performance monitoring for Core Web Vitals and RUM */}
            <PerformanceMonitor />
            {/* Live chat widget - Disabled */}
            {/* <CrispChat /> */}
            <Toaster />
            </I18nProvider>
          </SupabaseProvider>
        </ReducedMotionProvider>
      </body>
    </html>
  );
} 