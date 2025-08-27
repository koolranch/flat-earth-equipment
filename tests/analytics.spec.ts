// tests/analytics.spec.ts
import { test, expect } from '@playwright/test';

function capture(page) {
  const events = [] as string[];
  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('[analytics]')) {
      events.push(txt);
    }
  });
  return events;
}

test('DemoPanel emits demo_start and demo_complete', async ({ page, baseURL }) => {
  const evts = capture(page);
  await page.goto(`${baseURL}/module/pre-op/demo/minippe`);
  // Click Start, then Continue (adjust selectors if needed)
  await page.getByRole('button', { name: /start/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(300);
  expect(evts.some(e => e.includes('demo_start'))).toBeTruthy();
  expect(evts.some(e => e.includes('demo_complete'))).toBeTruthy();
});

test('Stability sim emits sim_param_change', async ({ page, baseURL }) => {
  const evts = capture(page);
  await page.goto(`${baseURL}/module/stability/sim`);
  // Nudge first slider
  const sliders = page.locator('input[type="range"]');
  await sliders.first().press('ArrowRight');
  await page.waitForTimeout(300);
  expect(evts.some(e => e.includes('sim_param_change'))).toBeTruthy();
});

test('Quiz emits quiz_item_answered (if QUIZ_URL provided)', async ({ page, baseURL }) => {
  const QUIZ_URL = process.env.QUIZ_URL; // e.g., /module/1/quiz
  test.skip(!QUIZ_URL, 'QUIZ_URL not provided');
  const evts = capture(page);
  await page.goto(`${baseURL}${QUIZ_URL}`);
  // Heuristic: click first button on page
  await page.getByRole('button').first().click();
  await page.waitForTimeout(300);
  expect(evts.some(e => e.includes('quiz_item_answered'))).toBeTruthy();
});
