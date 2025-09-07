import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Module 1: quiz handles wrong then pass + persists', async ({ page }) => {
  await page.goto(`${BASE}/training/module-1`);

  // Quickly unlock if your UI needs clicks — fallback if already unlocked
  const startBtn = page.getByRole('button', { name: /Start Quiz/i });
  if (await startBtn.isDisabled()) {
    // Tap first 4 PPE in order
    for (const txt of ['Hi-vis vest','Hard hat','Eye protection','Seatbelt']) {
      await page.getByRole('button', { name: new RegExp(txt, 'i') }).click();
    }
    // Tap the four controls (labels from component)
    for (const txt of ['Horn','Parking brake','Ignition','Lift']) {
      await page.getByRole('button', { name: new RegExp(txt, 'i') }).click();
    }
  }

  await startBtn.click();

  // Answer the first question incorrectly on purpose if choices visible
  const choices = page.getByRole('radio');
  if (await choices.count()) {
    await choices.first().click();
  }
  // Submit
  const submit = page.getByRole('button', { name: /submit|next/i });
  await submit.click().catch(() => {});

  // Now retake/continue and select the last choice on each screen to finish
  const next = page.getByRole('button', { name: /next|continue|finish/i });
  for (let i = 0; i < 6; i++) { // over-iterate safely
    if (await choices.count()) {
      await choices.nth((await choices.count()) - 1).click().catch(() => {});
    }
    if (await next.isVisible()) await next.click().catch(() => {});
  }

  // Expect some completion indicator or the modal to close
  await expect(page.getByText(/complete|passed|nice work/i)).toBeVisible({ timeout: 5000 });

  // Check persistence (localStorage key)
  const persisted = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('training:progress:v1') || '{}'); } catch { return {}; }
  });
  expect(persisted && persisted['module_1']).toBeTruthy();
});
