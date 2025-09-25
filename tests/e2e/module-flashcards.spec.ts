import { test, expect } from '@playwright/test';

// Smoke test that a standard module renders the flashcards/quiz tabs again
// Assumes order=2 is your first real module with content_slug.

test('Module 2 renders learning tabs and flashcards', async ({ page }) => {
  await page.goto('/training/module/2?courseId=forklift');
  // Tab labels vary; look for something stable like "Flashcards" or the quiz tab button
  await expect(page.getByText(/Flash/i)).toBeVisible();
  // If you have a known card text, assert it. Otherwise, check the presence of card UI controls.
});
