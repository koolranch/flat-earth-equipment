/**
 * Main Performance Audit Runner
 * Tests FEE website performance using browser automation
 */

import fs from 'fs';
import { KEY_PAGES, testPagePerformance } from './browser-performance-audit.js';

// Mock browser function for testing
function createBrowserMock() {
  return async function mockBrowser(action) {
    // This will be replaced by actual browser calls
    console.log('Mock browser call:', action.action);
    if (action.action === 'navigate') {
      return { success: true };
    } else if (action.action === 'act' && action.request.kind === 'evaluate') {
      // Return mock performance data
      return {
        result: {
          url: 'https://example.com',
          timestamp: new Date().toISOString(),
          timing: { navigationStart: 0, loadEventEnd: 3500, domContentLoadedEventEnd: 2000, responseStart: 800, domInteractive: 1500 },
          resourceCount: 45,
          calculated: {
            dom_content_loaded: 2000,
            load_complete: 3500,
            first_byte: 800,
            dom_interactive: 1500,
            page_size_mb: 2.3
          },
          vitals: {
            lcp: 2800,
            cls: 0.12
          },
          issues: []
        }
      };
    }
    return {};
  };
}

async function runAudit(useMockBrowser = false) {
  console.log('🚀 Starting FEE Browser Performance Audit...\n');
  
  const browser = useMockBrowser ? createBrowserMock() : null;
  const results = [];
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (!browser) {
    console.log('❌ Browser automation not available. Run this script from Clawdbot context.');
    return [];
  }
  
  for (let i = 0; i < KEY_PAGES.length; i++) {
    const page = KEY_PAGES[i];
    const result = await testPagePerformance(page, browser);
    results.push(result);
    
    // Brief delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate report
  generateReport(results);
  
  return results;
}

function generateReport(results) {
  console.log('\n📈 FEE PERFORMANCE REPORT');
  console.log('='.repeat(50));
  
  const validResults = results.filter(r => !r.error);
  const totalScore = validResults.reduce((sum, r) => sum + r.score, 0);
  const avgScore = validResults.length > 0 ? Math.round(totalScore / validResults.length) : 0;
  
  console.log(`\n🎯 OVERALL SCORE: ${avgScore}/100`);
  console.log(`Pages tested: ${validResults.length}/${results.length}`);
  
  console.log('\n📊 Individual Page Scores:');
  console.log('-'.repeat(50));
  
  // Sort by score (worst first)
  const sorted = validResults.sort((a, b) => a.score - b.score);
  
  sorted.forEach(result => {
    const status = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
    console.log(`${status} ${result.name}: ${result.score}/100`);
    
    if (result.metrics.load_complete) {
      console.log(`   Load Time: ${Math.round(result.metrics.load_complete/100)/10}s`);
    }
    if (result.vitals.lcp) {
      console.log(`   LCP: ${Math.round(result.vitals.lcp/100)/10}s | CLS: ${result.vitals.cls || 'N/A'}`);
    }
    if (result.issues.length > 0) {
      console.log(`   Issues: ${result.issues.slice(0, 2).join(', ')}`);
    }
    console.log('');
  });
  
  // Priority recommendations
  console.log('\n💡 PRIORITY RECOMMENDATIONS');
  console.log('-'.repeat(30));
  
  const criticalPages = validResults.filter(r => r.score < 50);
  const slowPages = validResults.filter(r => r.metrics.load_complete > 5000);
  const largeLCP = validResults.filter(r => r.vitals.lcp > 4000);
  
  if (criticalPages.length > 0) {
    console.log(`🔴 CRITICAL: ${criticalPages.length} pages with scores <50`);
    criticalPages.forEach(p => console.log(`   • ${p.name}`));
  }
  
  if (slowPages.length > 0) {
    console.log(`🟡 SLOW: ${slowPages.length} pages loading >5s`);
  }
  
  if (largeLCP.length > 0) {
    console.log(`🟡 LCP: ${largeLCP.length} pages with LCP >4s`);
  }
  
  // Technical recommendations
  console.log('\n🔧 TECHNICAL RECOMMENDATIONS');
  console.log('-'.repeat(30));
  
  if (avgScore < 70) {
    console.log('• Optimize images: Convert to WebP, implement lazy loading');
    console.log('• Minimize JavaScript: Split bundles, remove unused code');
    console.log('• Enable compression: Gzip/Brotli for all text assets');
    console.log('• Implement caching: Browser cache, CDN optimization');
  }
  
  const allIssues = validResults.flatMap(r => r.issues);
  const issueCount = {};
  allIssues.forEach(issue => {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  });
  
  Object.entries(issueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([issue, count]) => {
      console.log(`• ${issue} (${count} pages affected)`);
    });
  
  // Save results
  const reportPath = `./performance-audit-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${reportPath}`);
  
  // Return summary for next steps
  return {
    avgScore,
    criticalPages: criticalPages.length,
    slowPages: slowPages.length,
    recommendations: avgScore < 70 ? [
      'Image optimization',
      'JavaScript bundling',
      'Caching strategy',
      'Core Web Vitals improvements'
    ] : ['Monitor and maintain current performance']
  };
}

export { runAudit, generateReport };