import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('Final Exam: start → answer → submit → completion UI', async ({ page }) => {
  await page.goto(`${BASE}/training/final`);
  await page.getByRole('button', { name: /Start Final Exam/i }).click();

  // We land at /exam/:attemptId
  await expect(page).toHaveURL(/\/exam\//);

  // Answer each question (choose last option to keep deterministic)
  const groups = await page.locator('ol li').all();
  for (const li of groups) {
    const radios = li.getByRole('radio');
    const count = await radios.count();
    if (count > 0) await radios.nth(count - 1).click();
  }

  await page.getByRole('button', { name: /Submit Exam/i }).click();

  // Either pass or fail is OK for smoke; just assert result and (if passed) Records link
  await expect(page.getByText(/Exam (Passed|Failed)/)).toBeVisible();
  const recordsLink = page.getByRole('link', { name: /Records/i });
  if (await recordsLink.isVisible()) {
    await recordsLink.click();
    await expect(page).toHaveURL(/\/records/);
  }
});
