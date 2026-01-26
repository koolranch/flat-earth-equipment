/**
 * Browser-based Performance Audit for FEE
 * Uses Clawdbot browser tool to test Core Web Vitals and performance metrics
 */

import fs from 'fs';

// Key pages to test
const KEY_PAGES = [
  { url: 'https://www.flatearthequipment.com/', name: 'Homepage' },
  { url: 'https://www.flatearthequipment.com/about', name: 'About Page' },
  { url: 'https://www.flatearthequipment.com/contact', name: 'Contact Page' },
  { url: 'https://www.flatearthequipment.com/parts', name: 'Parts Catalog' },
  { url: 'https://www.flatearthequipment.com/training/forklift-operator', name: 'Training Page' },
  { url: 'https://www.flatearthequipment.com/brand/toyota/serial-lookup', name: 'Toyota Serial Lookup' },
  { url: 'https://www.flatearthequipment.com/brand/cat/fault-codes', name: 'Cat Fault Codes' },
  { url: 'https://www.flatearthequipment.com/parts/forklift-parts', name: 'Forklift Parts' },
  { url: 'https://www.flatearthequipment.com/osha-operator-training', name: 'OSHA Training' }
];

/**
 * Test Core Web Vitals using browser performance API
 */
const PERFORMANCE_TEST_SCRIPT = `
(async () => {
  // Wait for page to be fully loaded
  if (document.readyState !== 'complete') {
    await new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    });
  }
  
  // Wait a bit more for any async content
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const metrics = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    timing: performance.timing,
    navigation: performance.navigation,
    memory: performance.memory || null,
    resourceCount: performance.getEntriesByType('resource').length,
    resources: performance.getEntriesByType('resource').slice(0, 10), // First 10 resources
    paintTimings: {},
    vitals: {}
  };
  
  // Get paint timings
  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(entry => {
    metrics.paintTimings[entry.name.replace(/-/g, '_')] = Math.round(entry.startTime);
  });
  
  // Calculate key metrics from timing
  const timing = performance.timing;
  if (timing.navigationStart) {
    metrics.calculated = {
      dom_content_loaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      load_complete: timing.loadEventEnd - timing.navigationStart,
      first_byte: timing.responseStart - timing.navigationStart,
      dom_interactive: timing.domInteractive - timing.navigationStart,
      dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
      server_response: timing.responseEnd - timing.requestStart,
      dom_processing: timing.domComplete - timing.domLoading,
      page_size_mb: 0 // Will be estimated from resources
    };
    
    // Estimate page size from resources
    let totalSize = 0;
    performance.getEntriesByType('resource').forEach(resource => {
      if (resource.transferSize) totalSize += resource.transferSize;
    });
    metrics.calculated.page_size_mb = Math.round((totalSize / 1024 / 1024) * 100) / 100;
  }
  
  // Get Largest Contentful Paint if available
  if ('PerformanceObserver' in window) {
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        metrics.vitals.lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
      }
    } catch (e) {
      // LCP might not be available
    }
    
    try {
      const clsEntries = performance.getEntriesByType('layout-shift');
      if (clsEntries.length > 0) {
        const clsScore = clsEntries.reduce((sum, entry) => {
          return sum + (entry.hadRecentInput ? 0 : entry.value);
        }, 0);
        metrics.vitals.cls = Math.round(clsScore * 10000) / 10000; // Round to 4 decimals
      }
    } catch (e) {
      // CLS might not be available
    }
  }
  
  // Check for common performance issues
  metrics.issues = [];
  
  if (metrics.calculated) {
    if (metrics.calculated.first_byte > 1000) {
      metrics.issues.push('Slow server response (>1s TTFB)');
    }
    if (metrics.calculated.dom_content_loaded > 3000) {
      metrics.issues.push('Slow DOM ready (>3s)');
    }
    if (metrics.calculated.load_complete > 5000) {
      metrics.issues.push('Slow page load (>5s)');
    }
    if (metrics.calculated.page_size_mb > 3) {
      metrics.issues.push('Large page size (>3MB)');
    }
  }
  
  if (metrics.vitals.lcp > 4000) {
    metrics.issues.push('Poor LCP (>4s)');
  }
  if (metrics.vitals.cls > 0.25) {
    metrics.issues.push('Poor CLS (>0.25)');
  }
  
  if (metrics.resourceCount > 100) {
    metrics.issues.push('Too many resources (' + metrics.resourceCount + ')');
  }
  
  return metrics;
})();
`;

async function testPagePerformance(page, browser) {
  console.log(`📊 Testing: ${page.name}`);
  
  try {
    // Navigate to page
    await browser({
      action: 'navigate',
      targetUrl: page.url,
      timeoutMs: 30000
    });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run performance measurement script
    const result = await browser({
      action: 'act',
      request: {
        kind: 'evaluate',
        fn: PERFORMANCE_TEST_SCRIPT
      }
    });
    
    const metrics = result.result;
    
    // Calculate performance score (simple algorithm)
    let score = 100;
    if (metrics.calculated) {
      if (metrics.calculated.first_byte > 1000) score -= 10;
      if (metrics.calculated.first_byte > 2000) score -= 10;
      if (metrics.calculated.dom_content_loaded > 3000) score -= 15;
      if (metrics.calculated.dom_content_loaded > 5000) score -= 15;
      if (metrics.calculated.load_complete > 5000) score -= 15;
      if (metrics.calculated.load_complete > 8000) score -= 15;
      if (metrics.calculated.page_size_mb > 3) score -= 10;
    }
    if (metrics.vitals.lcp > 4000) score -= 20;
    if (metrics.vitals.cls > 0.25) score -= 15;
    if (metrics.resourceCount > 100) score -= 10;
    
    score = Math.max(score, 0);
    
    const result_summary = {
      url: page.url,
      name: page.name,
      score: score,
      metrics: metrics.calculated || {},
      vitals: metrics.vitals || {},
      issues: metrics.issues || [],
      resourceCount: metrics.resourceCount,
      timestamp: metrics.timestamp
    };
    
    console.log(`   Score: ${score}/100`);
    if (metrics.calculated) {
      console.log(`   Load: ${Math.round(metrics.calculated.load_complete/1000*10)/10}s | TTFB: ${Math.round(metrics.calculated.first_byte)}ms`);
    }
    if (metrics.vitals.lcp) {
      console.log(`   LCP: ${Math.round(metrics.vitals.lcp)}ms | CLS: ${metrics.vitals.cls || 'N/A'}`);
    }
    if (result_summary.issues.length > 0) {
      console.log(`   Issues: ${result_summary.issues.join(', ')}`);
    }
    
    return result_summary;
    
  } catch (error) {
    console.error(`❌ Error testing ${page.name}:`, error.message);
    return {
      url: page.url,
      name: page.name,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export { KEY_PAGES, testPagePerformance, PERFORMANCE_TEST_SCRIPT };