import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Smoke: page renders something (we expect access denied for anon/non-trainer)
test('Trainer page access (anon)', async ({ page }) => {
  await page.goto(`${BASE}/trainer`);
  await expect(page.getByText(/Access denied/i)).toBeVisible();
});

// Optional: API smokes when you provide server auth creds in the env or run locally with a trainer user
test.describe('Trainer API Tests', () => {
  test.skip(!process.env.TRAINER_TEST, 'set TRAINER_TEST=1 to run API smokes');

  test('Courses list returns ok', async ({ request }) => {
    const r = await request.get(`${BASE}/api/courses`);
    expect(r.ok()).toBeTruthy();
  });

  // NOTE: Roster requires course_id; we only check that an error message is structured
  test('Roster missing_course_id returns 400', async ({ request }) => {
    const r = await request.get(`${BASE}/api/trainer/roster`);
    expect(r.status()).toBe(400);
  });
});
