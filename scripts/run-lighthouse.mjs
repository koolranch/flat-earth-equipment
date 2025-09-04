import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import fs from 'fs';

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://flatearthequipment.com';
const urls = [`${BASE}/training`, `${BASE}/training/exam`];
const thresholds = { accessibility: 0.85, performance: 0.75 };

console.log('🔦 Running Lighthouse audits...');
console.log('📊 Thresholds:', thresholds);
console.log('🎯 URLs:', urls);

const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
const opts = { 
  logLevel: 'error', 
  output: 'html', 
  port: chrome.port, 
  onlyCategories: ['performance', 'accessibility'],
  // Mobile-first testing
  formFactor: 'mobile',
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4
  }
};

const results = [];

try {
  for (const url of urls) {
    console.log(`\n🔍 Auditing: ${url}`);
    
    try {
      const runner = await lighthouse(url, opts);
      
      if (!runner || !runner.lhr) {
        console.error(`❌ Failed to audit ${url} - no results returned`);
        results.push({ 
          url, 
          a11y: 0, 
          perf: 0, 
          file: null,
          rawA11y: 0,
          rawPerf: 0,
          error: 'No results returned'
        });
        continue;
      }
      
      const html = runner.report;
      
      // Ensure report directory exists
      fs.mkdirSync('lh-report', { recursive: true });
      
      // Generate clean filename from URL path
      const file = `lh-report/${new URL(url).pathname.replace(/\W+/g, '_')}.html`;
      fs.writeFileSync(file, html);
      
      const a11y = runner.lhr.categories.accessibility?.score || 0;
      const perf = runner.lhr.categories.performance?.score || 0;
      
      results.push({ 
        url, 
        a11y: Math.round(a11y * 100), 
        perf: Math.round(perf * 100), 
        file,
        rawA11y: a11y,
        rawPerf: perf
      });
      
      console.log(`📈 Scores: A11y ${Math.round(a11y * 100)}%, Perf ${Math.round(perf * 100)}%`);
      console.log(`📄 Report: ${file}`);
      
    } catch (err) {
      console.error(`❌ Error auditing ${url}:`, err.message);
      results.push({ 
        url, 
        a11y: 0, 
        perf: 0, 
        file: null,
        rawA11y: 0,
        rawPerf: 0,
        error: err.message
      });
    }
  }
} finally {
  await chrome.kill();
}

console.log('\n📊 Final Results:');
console.log('================');

let hasFailures = false;

for (const r of results) {
  const a11yPass = r.rawA11y >= thresholds.accessibility;
  const perfPass = r.rawPerf >= thresholds.performance;
  const status = (a11yPass && perfPass) ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${status} ${r.url}`);
  console.log(`  📊 Accessibility: ${r.a11y}% (${a11yPass ? 'PASS' : 'FAIL'} - need ≥${Math.round(thresholds.accessibility * 100)}%)`);
  console.log(`  ⚡ Performance: ${r.perf}% (${perfPass ? 'PASS' : 'FAIL'} - need ≥${Math.round(thresholds.performance * 100)}%)`);
  console.log(`  📄 Report: ${r.file}`);
  
  if (!a11yPass || !perfPass) {
    hasFailures = true;
  }
}

if (hasFailures) {
  console.log('\n❌ Some pages failed to meet thresholds');
  process.exitCode = 1;
} else {
  console.log('\n✅ All pages meet quality thresholds!');
}

console.log(`\n📁 Reports saved to: ./lh-report/`);
