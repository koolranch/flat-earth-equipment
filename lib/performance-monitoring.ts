/**
 * Core Web Vitals Performance Monitoring for FEE
 * Implements Real User Monitoring (RUM) and performance tracking
 */

// Performance thresholds (Google's recommendations)
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals thresholds
  LCP: {
    GOOD: 2500,
    NEEDS_IMPROVEMENT: 4000
  },
  FID: {
    GOOD: 100,
    NEEDS_IMPROVEMENT: 300
  },
  CLS: {
    GOOD: 0.1,
    NEEDS_IMPROVEMENT: 0.25
  },
  // Additional metrics
  TTFB: {
    GOOD: 800,
    NEEDS_IMPROVEMENT: 1800
  },
  FCP: {
    GOOD: 1800,
    NEEDS_IMPROVEMENT: 3000
  }
};

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  delta?: number;
  navigationType?: string;
  url?: string;
  timestamp?: number;
}

export interface PagePerformanceData {
  url: string;
  loadTime: number;
  domReady: number;
  ttfb: number;
  resourceCount: number;
  pageSize: number;
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

/**
 * Determine performance rating based on value and thresholds
 */
export function getPerformanceRating(
  metricName: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metricName];
  if (value <= thresholds.GOOD) return 'good';
  if (value <= thresholds.NEEDS_IMPROVEMENT) return 'needs-improvement';
  return 'poor';
}

/**
 * Send performance data to analytics endpoint
 */
export function sendToAnalytics(metric: PerformanceMetric) {
  // Only send in production and with user consent
  if (process.env.NODE_ENV !== 'production') {
    console.log('Performance metric (dev):', metric);
    return;
  }

  const body = JSON.stringify({
    ...metric,
    url: window.location.pathname,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  });

  // Use sendBeacon for reliability (survives page navigation)
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/performance', body);
  } else {
    // Fallback for older browsers
    fetch('/api/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    }).catch(() => {
      // Fail silently - don't block user experience
    });
  }
}

/**
 * Collect basic page performance data using Navigation Timing API
 */
export function collectPagePerformance(): PagePerformanceData | null {
  if (!('performance' in window) || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  // Skip if navigation timing not ready
  if (timing.loadEventEnd === 0) {
    return null;
  }

  const data: PagePerformanceData = {
    url: window.location.pathname,
    loadTime: timing.loadEventEnd - timing.navigationStart,
    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
    ttfb: timing.responseStart - timing.requestStart,
    resourceCount: window.performance.getEntriesByType('resource').length,
    pageSize: calculatePageSize(),
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };

  // Add connection information if available
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      data.connectionType = conn.effectiveType || conn.type;
    }
  }

  return data;
}

/**
 * Calculate estimated page size from resource entries
 */
function calculatePageSize(): number {
  if (!('performance' in window)) return 0;

  let totalSize = 0;
  const resources = window.performance.getEntriesByType('resource');
  
  resources.forEach((resource: any) => {
    if (resource.transferSize) {
      totalSize += resource.transferSize;
    }
  });

  return Math.round(totalSize / 1024); // Return in KB
}

/**
 * Generate or retrieve session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('perf_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('perf_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Debounce function to limit metric reporting frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | undefined;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }) as T;
}

/**
 * Performance observer setup for Core Web Vitals
 */
export function setupPerformanceObserver() {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  // Set up observers for different metric types
  try {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      sendToAnalytics({
        name: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating: getPerformanceRating('LCP', lastEntry.startTime),
        id: `${Date.now()}-${Math.random()}`,
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // FID Observer
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        sendToAnalytics({
          name: 'FID',
          value: Math.round(entry.processingStart - entry.startTime),
          rating: getPerformanceRating('FID', entry.processingStart - entry.startTime),
          id: `${Date.now()}-${Math.random()}`,
        });
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // CLS Observer
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      // Report CLS when page is about to be unloaded
      const reportCLS = debounce(() => {
        sendToAnalytics({
          name: 'CLS',
          value: Math.round(clsValue * 10000) / 10000,
          rating: getPerformanceRating('CLS', clsValue),
          id: `${Date.now()}-${Math.random()}`,
        });
      }, 500);

      reportCLS();
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

  } catch (error) {
    console.warn('Performance observer setup failed:', error);
  }
}

/**
 * Report page load performance after window load
 */
export function reportPageLoad() {
  // Wait for load event to complete
  if (document.readyState === 'complete') {
    setTimeout(() => {
      const perfData = collectPagePerformance();
      if (perfData) {
        sendToAnalytics({
          name: 'PageLoad',
          value: perfData.loadTime,
          rating: perfData.loadTime < 3000 ? 'good' : perfData.loadTime < 5000 ? 'needs-improvement' : 'poor',
          id: `${Date.now()}-${Math.random()}`,
        });

        sendToAnalytics({
          name: 'TTFB',
          value: perfData.ttfb,
          rating: getPerformanceRating('TTFB', perfData.ttfb),
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    }, 0);
  } else {
    window.addEventListener('load', reportPageLoad, { once: true });
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Set up Core Web Vitals monitoring
  setupPerformanceObserver();
  
  // Report page load performance
  reportPageLoad();

  // Report performance when page is hidden (user navigates away)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const perfData = collectPagePerformance();
      if (perfData) {
        // Send any final performance data
        navigator.sendBeacon?.(
          '/api/performance',
          JSON.stringify({
            ...perfData,
            event: 'page_exit',
          })
        );
      }
    }
  });
}

/**
 * Manual performance tracking for specific actions
 */
export function trackCustomMetric(name: string, value: number, additionalData?: Record<string, any>) {
  sendToAnalytics({
    name,
    value,
    rating: 'good', // Default rating for custom metrics
    id: `${Date.now()}-${Math.random()}`,
    ...additionalData,
  });
}