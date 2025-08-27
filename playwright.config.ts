// playwright.config.ts
import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  use: { baseURL },
  timeout: 60000,
  // CI will: build -> start server -> run tests
  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  reporter: [['list'], ['html', { open: 'never' }]]
});