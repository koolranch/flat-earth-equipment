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
import ReducedMotionProvider from '@/components/a11y/ReducedMotionProvider';
import ReducedMotionToggle from '@/components/a11y/ReducedMotionToggle';
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher';
import { getAdminStatus } from '@/lib/admin/guard';
// Import your global styles (Tailwind, custom resets)
import '../globals.css';
import { Toaster } from 'react-hot-toast';
import QAEventListener from '@/components/dev/QAEventListener';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Flat Earth Equipment | Parts & Rentals for Forklifts, Scissor Lifts & More",
  description: "Flat Earth Equipment delivers precision-fit industrial parts and rugged rental equipment — with same-day shipping across the Western U.S.",
};



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale from cookies on the server
  const cookieLocale = cookies().get('locale')?.value;
  const envDefault = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'es' ? 'es' : 'en') as 'en' | 'es';
  const locale: 'en' | 'es' = (cookieLocale === 'es' || cookieLocale === 'en') ? cookieLocale : envDefault;
  
  // Check admin status for conditional header link (non-blocking)
  let adminStatus = { isAdmin: false };
  try {
    adminStatus = await getAdminStatus();
  } catch {
    // Silently fail - admin link just won't show
  }
  
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
        {/* Client-side error monitoring */}
        <script src="/monitor.js" async />
      </head>
      <body className="font-sans text-gray-900 bg-gray-50 antialiased">
        <ReducedMotionProvider>
          <SupabaseProvider>
            <I18nProvider>
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
                  <a className="text-sm underline hover:no-underline" href="/safety">Safety</a>
                  <a className="text-sm underline hover:no-underline" href="/trainer">Trainer</a>
                  <a className="text-sm underline hover:no-underline" href="/records">Records</a>
                  {adminStatus.isAdmin && (
                    <a className="text-sm underline hover:no-underline text-blue-600 dark:text-blue-400" href="/admin/roster">Admin</a>
                  )}
                  <LocaleSwitcher />
                </nav>
              </div>
            </header>
            
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