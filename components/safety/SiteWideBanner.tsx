'use client';

/**
 * Site-wide Black Friday banner
 * Shows at top of all pages with dismiss option
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function SiteWideBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Check if user dismissed banner in this session
    const isDismissed = sessionStorage.getItem('bf-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);
  
  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('bf-banner-dismissed', 'true');
  };
  
  if (dismissed) return null;
  
  return (
    <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white py-3 px-4 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Icon + Message */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl hidden sm:block animate-bounce">🎉</span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-black text-sm sm:text-base uppercase tracking-wide">
              Black Friday: $10 Off Forklift Training
            </span>
            <span className="text-xs sm:text-sm opacity-90 font-medium">
              Get certified for just $49 — Limited time!
            </span>
          </div>
        </div>
        
        {/* Center: CTA Button */}
        <Link 
          href="/safety#pricing"
          className="hidden sm:inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
        >
          Get Started
          <span className="text-xs">→</span>
        </Link>
        
        {/* Right: Close Button */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mobile CTA */}
      <div className="sm:hidden mt-2">
        <Link 
          href="/safety#pricing"
          className="block text-center bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
        >
          Get Started — $49
        </Link>
      </div>
      
      {/* Animated underline */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
    </div>
  );
}

