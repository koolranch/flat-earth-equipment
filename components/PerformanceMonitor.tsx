'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance-monitoring';

/**
 * Client-side Performance Monitor component
 * Initializes Core Web Vitals tracking and RUM system
 */
export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring only in production
    if (process.env.NODE_ENV === 'production') {
      initPerformanceMonitoring();
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}