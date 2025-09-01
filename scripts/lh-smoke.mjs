import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/training', '/exam/final'];
const THRESHOLDS = { performance: 0.85, bestPractices: 0.90 };

async function run() {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const opts = { logLevel: 'error', output: 'json', port: chrome.port };  
  let fail = false;
  
  for (const p of PAGES) {
    const url = `${BASE}${p}`;
    const res = await lighthouse(url, opts, { extends: 'lighthouse:default' });
    const cat = res.lhr.categories;
    const perf = cat.performance.score || 0;
    const bp = cat['best-practices'].score || 0;
    console.log(`[LH] ${url} → Perf: ${Math.round(perf * 100)}, BP: ${Math.round(bp * 100)}`);
    if (perf < THRESHOLDS.performance || bp < THRESHOLDS.bestPractices) fail = true;
  }
  
  await chrome.kill();
  if (fail) { 
    console.error('Lighthouse thresholds not met.'); 
    process.exit(1); 
  }
  console.log('Lighthouse thresholds met.');
}

run();
