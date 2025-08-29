import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function getEvents(page: any) {
  return await page.evaluate(() => (window as any).__qaEvents || []);
}

test.describe('Demos', () => {
  test('PPE strict-order completes and fires events', async ({ page }) => {
    await page.goto(`${BASE}/module/pre-operation-inspection`);
    
    // Click in order
    await page.getByRole('button', { name: /hi-vis vest/i }).click();
    await page.getByRole('button', { name: /hard hat/i }).click();
    await page.getByRole('button', { name: /parking brake/i }).click();
    await page.getByRole('button', { name: /lower forks/i }).click();
    await page.getByRole('button', { name: /mark complete/i }).click();
    
    const evts = await getEvents(page);
    expect(evts.some((e: any) => e.evt === 'demo_complete' && e.demo === 'MiniPPE')).toBeTruthy();
  });

  test('Inspection 8-point completes', async ({ page }) => {
    await page.goto(`${BASE}/module/eight-point-inspection`);
    
    const buttons = await page.getByRole('button').all();
    // click first 8 checklist-like buttons
    let clicked = 0;
    for (const b of buttons) {
      const name = await b.textContent();
      if (name && /tires|forks|chain|hydraulic|controls|battery|horn|seat/i.test(name) && !(await b.isDisabled())) {
        await b.click(); 
        clicked++;
      }
      if (clicked >= 8) break;
    }
    await page.getByRole('button', { name: /mark complete/i }).click();
    
    const evts = await getEvents(page);
    expect(evts.some((e: any) => e.evt === 'demo_complete' && e.demo === 'MiniInspection')).toBeTruthy();
  });

  test('Hazard spotting completes with random set', async ({ page }) => {
    await page.goto(`${BASE}/module/hazard-hunt`);
    
    // click 6 hazard buttons (look for ✓ after click)
    let count = 0;
    const maxTries = 30;
    for (let i = 0; i < maxTries; i++) {
      const buttons = await page.getByRole('button').all();
      for (const b of buttons) {
        const disabled = await b.isDisabled();
        if (!disabled) { 
          await b.click(); 
          count++; 
          if (count >= 6) break; 
        }
      }
      if (count >= 6) break;
    }
    await page.getByRole('button', { name: /mark complete/i }).click();
    
    const evts = await getEvents(page);
    expect(evts.some((e: any) => e.evt === 'demo_complete' && e.demo === 'MiniHazard')).toBeTruthy();
  });
});
