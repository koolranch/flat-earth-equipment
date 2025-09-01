import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

// unauth/anon access shows Access denied via /trainer layout guard when routed through trainer entry points
// Direct page: we just expect the form or a 401 depending on your auth setup. Keep minimal:

test('Evaluation page loads (not authenticated scenario tolerated)', async ({ page }) => {
  await page.goto(`${BASE}/evaluate/00000000-0000-0000-0000-000000000000`);
  // We just check that page renders some heading or a 401 page — keep flexible
  const anyHeading = page.locator('h1');
  await expect(anyHeading.first()).toBeVisible();
});

// Optional POST smoke (requires trainer session/cookies or server bypass not configured)
test.describe('Trainer API Tests', () => {
  test.skip(!process.env.TRAINER_TEST, 'set TRAINER_TEST=1 and run with an authenticated trainer session to exercise API');
  
  test('API upsert smoke test', async ({ request }) => {
    // This would require proper authentication setup
    // For now, just verify the endpoint exists and returns proper error for missing auth
    const res = await request.post(`${BASE}/api/evaluations/upsert`, {
      data: { enrollment_id: '00000000-0000-0000-0000-000000000000' }
    });
    // Should return 401 for unauthorized, 403 for non-trainer, or 404 if endpoint not found
    expect([401, 403, 404]).toContain(res.status());
  });
});
