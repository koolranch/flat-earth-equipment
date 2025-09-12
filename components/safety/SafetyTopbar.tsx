'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher';

/**
 * SafetyTopbar
 * Renders the safety/training micro header ONLY on training-related routes.
 * Routes included: /training, /safety, /trainer, /records
 */
export default function SafetyTopbar() {
  const pathname = usePathname() || '/';
  const show = pathname.startsWith('/training')
    || pathname.startsWith('/safety')
    || pathname.startsWith('/trainer')
    || pathname.startsWith('/records');

  if (!show) return null;

  // Using the exact markup from the existing layout to preserve styling
  return (
    <header role="banner" className="border-b bg-white">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <a href="/training" className="font-bold tracking-tight text-[#0F172A]">Flat Earth Safety</a>
        <nav aria-label="Global navigation" className="flex items-center gap-3">
          <a className="text-sm underline hover:no-underline" href="/training">Training</a>
          <a className="text-sm underline hover:no-underline" href="/safety">Safety</a>
          <a className="text-sm underline hover:no-underline" href="/trainer">Trainer</a>
          <a className="text-sm underline hover:no-underline" href="/records">Records</a>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
