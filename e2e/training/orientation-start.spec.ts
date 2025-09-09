import { test, expect } from "@playwright/test";

test("Start training CTA normalizes courseId", async ({ page }) => {
  await page.goto("/training/orientation");
  await page.getByRole("link", { name: /Start training/i }).click();
  await expect(page).toHaveURL(/\/training\?courseId=forklift_operator/);
  await expect(page.getByText(/Forklift Operator Training/i)).toBeVisible();
});
