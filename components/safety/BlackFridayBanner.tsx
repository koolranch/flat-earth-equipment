'use client';

/**
 * Black Friday promotional banner
 * Shows countdown and savings messaging
 */

import { useEffect, useState } from 'react';

type Props = {
  variant?: 'hero' | 'pricing' | 'sticky';
  showCountdown?: boolean;
};

export default function BlackFridayBanner({ variant = 'hero', showCountdown = true }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  
  // Set your Black Friday end date (adjust as needed)
  const endDate = new Date('2025-12-02T23:59:59'); // End of Cyber Monday
  
  useEffect(() => {
    if (!showCountdown) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      });
    }, 1000 * 60); // Update every minute
    
    return () => clearInterval(timer);
  }, [showCountdown, endDate]);
  
  // Hero variant - Large, attention-grabbing
  if (variant === 'hero') {
    return (
      <div className="relative inline-flex flex-col items-center gap-2 mb-6 animate-in fade-in duration-700">
        {/* Glowing badge */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-2xl border-2 border-white/30">
            🎉 Black Friday Special
          </div>
        </div>
        
        {/* Savings amount */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-orange-200">
          <span className="text-3xl font-black text-slate-900">$49</span>
          <div className="flex flex-col items-start">
            <span className="text-sm text-slate-500 line-through">$59</span>
            <span className="text-sm font-bold text-orange-600">Save $10</span>
          </div>
        </div>
        
        {/* Countdown */}
        {showCountdown && timeLeft.days >= 0 && (
          <div className="flex gap-2 text-xs text-slate-300">
            <span>⏰ Ends in:</span>
            <span className="font-mono font-bold text-orange-300">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
        )}
      </div>
    );
  }
  
  // Pricing card badge - Compact, eye-catching
  if (variant === 'pricing') {
    return (
      <div className="absolute -top-3 -right-3 z-10">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-red-500 blur-md opacity-60 animate-pulse"></div>
          {/* Badge */}
          <div className="relative bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-xl border-2 border-white transform rotate-3">
            <div className="text-xs font-black uppercase tracking-wide">$10 OFF</div>
            <div className="text-[10px] font-semibold opacity-90">Black Friday</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Sticky CTA banner - Inline, subtle
  if (variant === 'sticky') {
    return (
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold border border-orange-300">
        🎉 $10 OFF
      </div>
    );
  }
  
  return null;
}

