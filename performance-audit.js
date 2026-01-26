#!/usr/bin/env node

/**
 * FEE Performance Audit Script
 * Runs PageSpeed Insights tests on key pages and generates recommendations
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Key pages to test (prioritized by traffic and importance)
const KEY_PAGES = [
  'https://www.flatearthequipment.com/',
  'https://www.flatearthequipment.com/about',
  'https://www.flatearthequipment.com/contact',
  'https://www.flatearthequipment.com/parts',
  'https://www.flatearthequipment.com/training/forklift-operator',
  'https://www.flatearthequipment.com/brand/toyota/serial-lookup',
  'https://www.flatearthequipment.com/brand/cat/fault-codes',
  'https://www.flatearthequipment.com/parts/forklift-parts',
  'https://www.flatearthequipment.com/osha-operator-training',
  'https://www.flatearthequipment.com/locations/pueblo-co'
];

// Google PageSpeed Insights API key (set via environment variable)
const PSI_API_KEY = process.env.GOOGLE_API_KEY || process.env.PSI_API_KEY;

if (!PSI_API_KEY) {
  console.error('❌ Error: GOOGLE_API_KEY environment variable is required');
  console.error('   Set it with: export GOOGLE_API_KEY=your_api_key_here');
  process.exit(1);
}

async function testPageSpeed(url, strategy = 'mobile') {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PSI_API_KEY}&strategy=${strategy}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;
  
  return new Promise((resolve, reject) => {
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function extractMetrics(result) {
  const lighthouse = result.lighthouseResult;
  
  if (!lighthouse) {
    return { error: 'No Lighthouse data available' };
  }

  const categories = lighthouse.categories;
  const audits = lighthouse.audits;

  // Core Web Vitals
  const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
  const fid = audits['max-potential-fid']?.displayValue || 'N/A';
  const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
  const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
  const si = audits['speed-index']?.displayValue || 'N/A';
  const tti = audits['interactive']?.displayValue || 'N/A';
  const tbt = audits['total-blocking-time']?.displayValue || 'N/A';

  // Category scores (0-100)
  const performance = Math.round((categories.performance?.score || 0) * 100);
  const accessibility = Math.round((categories.accessibility?.score || 0) * 100);
  const bestPractices = Math.round((categories['best-practices']?.score || 0) * 100);
  const seo = Math.round((categories.seo?.score || 0) * 100);

  // Critical issues
  const issues = [];
  
  // Performance issues
  if (performance < 50) issues.push('🔴 Poor performance score');
  else if (performance < 90) issues.push('🟡 Moderate performance score');
  
  // Core Web Vitals issues
  if (audits['largest-contentful-paint']?.score < 0.5) issues.push('🔴 Poor LCP (>4s)');
  if (audits['cumulative-layout-shift']?.score < 0.5) issues.push('🔴 Poor CLS (>0.25)');
  if (audits['max-potential-fid']?.score < 0.5) issues.push('🔴 Poor FID (>300ms)');

  // SEO issues
  if (seo < 90) issues.push('🟡 SEO improvements needed');
  
  // Accessibility issues
  if (accessibility < 90) issues.push('🟡 Accessibility improvements needed');

  return {
    scores: { performance, accessibility, bestPractices, seo },
    vitals: { lcp, fid, cls, fcp, si, tti, tbt },
    issues,
    overall: Math.round((performance + accessibility + bestPractices + seo) / 4)
  };
}

async function runFullAudit() {
  console.log('🚀 Starting FEE Performance Audit...\n');
  
  const results = [];
  const timestamp = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < KEY_PAGES.length; i++) {
    const url = KEY_PAGES[i];
    const pageName = url.replace('https://www.flatearthequipment.com', '') || '/';
    
    console.log(`📊 Testing ${i + 1}/${KEY_PAGES.length}: ${pageName}`);
    
    try {
      // Test mobile first (primary traffic)
      const mobileResult = await testPageSpeed(url, 'mobile');
      const mobileMetrics = extractMetrics(mobileResult);
      
      // Brief delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test desktop
      const desktopResult = await testPageSpeed(url, 'desktop');
      const desktopMetrics = extractMetrics(desktopResult);
      
      results.push({
        url,
        pageName,
        mobile: mobileMetrics,
        desktop: desktopMetrics,
        timestamp
      });
      
      console.log(`   Mobile: ${mobileMetrics.overall}/100 | Desktop: ${desktopMetrics.overall}/100`);
      
      // Brief delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error testing ${pageName}:`, error.message);
      results.push({
        url,
        pageName,
        error: error.message,
        timestamp
      });
    }
  }
  
  // Generate report
  generateReport(results);
  
  return results;
}

function generateReport(results) {
  console.log('\n📈 PERFORMANCE AUDIT REPORT');
  console.log('='.repeat(50));
  
  const summary = {
    totalPages: results.length,
    avgMobileScore: 0,
    avgDesktopScore: 0,
    criticalIssues: 0,
    passingSEO: 0
  };
  
  let mobileTotal = 0;
  let desktopTotal = 0;
  let validResults = 0;
  
  console.log('\nPage Performance Summary:');
  console.log('-'.repeat(50));
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.pageName}: ERROR - ${result.error}`);
      return;
    }
    
    validResults++;
    mobileTotal += result.mobile.overall;
    desktopTotal += result.desktop.overall;
    
    if (result.mobile.scores.seo >= 90) summary.passingSEO++;
    if (result.mobile.overall < 50 || result.desktop.overall < 50) summary.criticalIssues++;
    
    console.log(`📱 ${result.pageName}:`);
    console.log(`   Mobile: ${result.mobile.overall}/100 (Perf: ${result.mobile.scores.performance}, SEO: ${result.mobile.scores.seo})`);
    console.log(`   Desktop: ${result.desktop.overall}/100 (Perf: ${result.desktop.scores.performance}, SEO: ${result.desktop.scores.seo})`);
    
    // Show critical issues
    if (result.mobile.issues.length > 0) {
      console.log(`   Issues: ${result.mobile.issues.join(', ')}`);
    }
    console.log('');
  });
  
  if (validResults > 0) {
    summary.avgMobileScore = Math.round(mobileTotal / validResults);
    summary.avgDesktopScore = Math.round(desktopTotal / validResults);
  }
  
  console.log('\n🎯 OVERALL SUMMARY');
  console.log('-'.repeat(30));
  console.log(`Average Mobile Score: ${summary.avgMobileScore}/100`);
  console.log(`Average Desktop Score: ${summary.avgDesktopScore}/100`);
  console.log(`Pages with SEO ≥90: ${summary.passingSEO}/${validResults}`);
  console.log(`Critical Performance Issues: ${summary.criticalIssues}`);
  
  // Recommendations
  console.log('\n💡 PRIORITY RECOMMENDATIONS');
  console.log('-'.repeat(30));
  
  if (summary.avgMobileScore < 60) {
    console.log('🔴 CRITICAL: Mobile performance needs immediate attention');
    console.log('   • Optimize images (WebP, lazy loading)');
    console.log('   • Minimize JavaScript bundles');
    console.log('   • Implement caching strategies');
  }
  
  if (summary.passingSEO < validResults * 0.8) {
    console.log('🟡 SEO: Multiple pages need meta description improvements');
    console.log('   • Add missing meta descriptions');
    console.log('   • Optimize title tags');
    console.log('   • Improve internal linking');
  }
  
  if (summary.criticalIssues > 0) {
    console.log('🔴 CRITICAL: Pages with scores <50 need immediate optimization');
  }
  
  // Save detailed results
  const reportPath = `./performance-audit-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${reportPath}`);
}

// Run the audit
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullAudit()
    .then(() => {
      console.log('\n✅ Audit completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Audit failed:', error);
      process.exit(1);
    });
}

export { testPageSpeed, extractMetrics, runFullAudit };