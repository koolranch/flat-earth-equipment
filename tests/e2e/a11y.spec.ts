import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const paths = ['/', '/training', '/records', '/verify/INVALID', '/privacy', '/terms'];

test.describe('@a11y axe sweep', () => {
  for (const p of paths){
    test(`a11y: ${p}`, async ({ page }) => {
      await page.goto(`${BASE}${p}`);
      // Pause for dynamic content
      await page.waitForTimeout(200);
      const results = await new AxeBuilder({ page }).analyze();
      const violations = results.violations || [];
      // Print concise report
      if (violations.length){
        // eslint-disable-next-line no-console
        console.log(`A11y violations on ${p}:`);
        for (const v of violations){
          console.log(`- ${v.id}: ${v.help} (nodes: ${v.nodes.length})`);
        }
      }
      expect(violations).toEqual([]);
    });
  }
});
