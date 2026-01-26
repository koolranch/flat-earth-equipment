'use client';

/**
 * Performance Monitor Component
 * Initializes Core Web Vitals tracking and Real User Monitoring
 */

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance-monitoring';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export default function PerformanceMonitor({ enabled = true }: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'production') {
      return;
    }

    // Initialize performance monitoring after a short delay
    // This ensures it doesn't interfere with critical page rendering
    const timer = setTimeout(() => {
      initPerformanceMonitoring();
    }, 100);

    return () => clearTimeout(timer);
  }, [enabled]);

  // This component renders nothing - it's purely functional
  return null;
}