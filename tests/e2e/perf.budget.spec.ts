import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const BUDGET = { requests: 60, bytes: 2_500_000 }; // adjust as needed

test('training page meets basic network budget and no forbidden tokens', async ({ page }) => {
  let total = 0; 
  let count = 0;
  
  page.on('response', async (resp) => {
    try {
      const len = Number(resp.headers()['content-length'] || 0);
      if (!Number.isNaN(len)) { 
        total += len; 
        count++; 
      }
    } catch {}
  });
  
  await page.goto(`${BASE}/training`);
  const html = await page.content();
  
  // Security check - no forbidden tokens in page source
  expect(html).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/i);
  
  // Performance budget checks
  expect(count).toBeLessThanOrEqual(BUDGET.requests);
  expect(total).toBeLessThanOrEqual(BUDGET.bytes);
  
  console.log(`Network budget: ${count}/${BUDGET.requests} requests, ${Math.round(total/1024)}KB/${Math.round(BUDGET.bytes/1024)}KB`);
});
