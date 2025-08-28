# Playwright Tests

This directory contains end-to-end tests for the Flat Earth Equipment training platform.

## Test Files

### Core Functionality
- `hub-resume.spec.ts` - Tests training hub resume functionality and navigation
- `quiz-retry.spec.ts` - Tests quiz retry flow and incorrect question handling
- `brand-hub.spec.ts` - Tests brand hub pages and serial lookup functionality
- `analytics.spec.ts` - Tests analytics event tracking
- `locale.spec.ts` - Tests internationalization and locale switching

## Setup

### Environment Variables

Create a `.env.test.local` file with the following variables:

```bash
# Base URL for testing
BASE_URL=http://localhost:3000

# Course ID for testing hub resume functionality
QA_COURSE_ID=your-course-uuid-here

# Optional: Additional test data
QA_LEARNER_ID=your-learner-uuid-here
QA_MODULE_1_ID=your-module-uuid-here
```

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test hub-resume.spec.ts

# Run tests with UI mode
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test by name
npx playwright test --grep "Hub shows Resume CTA"
```

### Test Environment

The tests are configured to:
- Start a local development server automatically
- Use the BASE_URL environment variable (defaults to localhost:3000)
- Skip tests that require specific environment variables if not set
- Generate HTML reports for test results

### Writing Tests

Follow these patterns when writing new tests:

1. **Use descriptive test names** that explain what is being tested
2. **Skip tests gracefully** when required environment variables are missing
3. **Use proper selectors** - prefer role-based selectors over CSS selectors
4. **Test mobile responsiveness** where applicable
5. **Include error handling** for flaky elements

Example:
```typescript
test('Feature works correctly', async ({ page, baseURL }) => {
  const requiredEnv = process.env.REQUIRED_VAR;
  test.skip(!requiredEnv, 'REQUIRED_VAR not set');
  
  await page.goto(`${baseURL}/path`);
  await expect(page.getByRole('button', { name: /click me/i })).toBeVisible();
});
```

## Test Categories

### Smoke Tests
Quick tests that verify core functionality is working:
- Hub resume flow (≤2 taps to resume)
- Quiz retry shows only incorrect items
- Basic page loading and navigation

### Integration Tests
Tests that verify multiple components working together:
- Complete quiz flow from start to finish
- Training progression and state management
- Cross-page navigation and data persistence

### Accessibility Tests
Tests that verify WCAG compliance:
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Skip links functionality

## Debugging

### Common Issues

1. **Tests timing out**: Increase timeout in playwright.config.ts
2. **Elements not found**: Check if selectors match current UI
3. **Server not starting**: Verify BASE_URL and server configuration
4. **Environment variables**: Ensure .env.test.local is properly configured

### Debug Mode

```bash
# Run with debug mode
npx playwright test --debug

# Run specific test with debug
npx playwright test hub-resume.spec.ts --debug

# Generate trace files
npx playwright test --trace on
```

### Screenshots and Videos

Tests automatically capture screenshots on failure. To enable video recording:

```typescript
// In playwright.config.ts
use: {
  video: 'retain-on-failure',
  screenshot: 'only-on-failure'
}
```
