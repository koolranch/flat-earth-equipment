# Playwright Smoke Tests

This document describes the Playwright smoke tests for hub resume and quiz retry functionality.

## Overview

The smoke tests verify two critical user flows:

1. **Hub Resume Flow** - Ensures users can resume training in ≤2 taps
2. **Quiz Retry Flow** - Ensures retry shows only incorrect items

## Test Files

### `tests/hub-resume.spec.ts`
Tests the training hub resume functionality:
- ✅ Resume CTA is visible and navigates correctly
- ✅ Progress and remaining steps are displayed
- ✅ Graceful handling of missing course ID
- ✅ Mobile responsive design

### `tests/quiz-retry.spec.ts`
Tests the quiz retry functionality:
- ✅ Quiz demo page loads and functions
- ✅ Retry shows only incorrect items (requires auth)
- ✅ Quiz completion flow works end-to-end
- ✅ Quiz modal can be closed
- ✅ Quiz shows progress during attempt
- ✅ Quiz handles loading states properly

## Running Tests

### Quick Smoke Test
```bash
# Run all smoke tests
npm run test:smoke:playwright

# Run with custom base URL
npm run test:smoke:playwright -- --base-url=http://localhost:3000

# Run with course ID for hub tests
npm run test:smoke:playwright -- --course-id=your-course-uuid-here
```

### Individual Test Files
```bash
# Run hub resume tests only
npx playwright test hub-resume.spec.ts

# Run quiz retry tests only
npx playwright test quiz-retry.spec.ts

# Run specific test
npx playwright test --grep "Hub shows Resume CTA"
```

### Debug Mode
```bash
# Run with browser visible
npx playwright test hub-resume.spec.ts --headed

# Run with debug mode
npx playwright test hub-resume.spec.ts --debug

# Generate trace files
npx playwright test --trace on
```

## Environment Variables

### Required for Full Testing
```bash
# Base URL for testing (default: http://localhost:3000)
BASE_URL=http://localhost:3000

# Course ID for testing hub resume functionality
QA_COURSE_ID=your-course-uuid-here
```

### Optional
```bash
# Learner ID for authenticated tests
QA_LEARNER_ID=your-learner-uuid-here

# Module IDs for specific module testing
QA_MODULE_1_ID=your-module-uuid-here
```

## Test Behavior

### Skipping Tests
Tests are designed to skip gracefully when:
- Required environment variables are missing
- User is not authenticated
- Required elements are not found
- Server is not running

### Example Output
```
🧪 Running Playwright Smoke Tests
--------------------------------------------------
BASE_URL     = http://localhost:3000
QA_COURSE_ID = (not set - some tests will skip)

🎯 Running Hub Resume Tests...
  3 skipped
  1 passed (2.0s)

🎮 Running Quiz Retry Tests...
  5 skipped
  1 passed (31.6s)

✅ All smoke tests completed!
```

## Acceptance Criteria

### Hub Resume Tests
- ✅ **Resume CTA Visible**: Training hub shows resume button
- ✅ **2-Tap Navigation**: Resume button navigates to module in ≤2 taps
- ✅ **Progress Display**: Shows progress percentage and remaining steps
- ✅ **Mobile Responsive**: Works on 375px width screens

### Quiz Retry Tests
- ✅ **Retry Functionality**: Failed quizzes offer retry with incorrect items only
- ✅ **Quiz Loading**: Quiz components load and display properly
- ✅ **Progress Tracking**: Quiz shows question progress and score
- ✅ **Modal Management**: Quiz modal can be opened and closed

## Integration with CI/CD

### In Build Pipeline
```bash
# Add to your CI/CD pipeline
npm run build
npm run start &
npm run test:smoke:playwright
```

### With QA Environment
```bash
# Test against QA environment
BASE_URL=https://qa.example.com QA_COURSE_ID=uuid npm run test:smoke:playwright
```

## Troubleshooting

### Common Issues

1. **Tests Skipping**
   - Ensure `QA_COURSE_ID` is set for hub tests
   - Verify server is running at `BASE_URL`
   - Check if user authentication is required

2. **Timeouts**
   - Increase timeout in `playwright.config.ts`
   - Check server performance
   - Verify network connectivity

3. **Element Not Found**
   - Check if UI has changed
   - Verify selectors in test files
   - Use `--headed` mode to see what's happening

### Debug Commands
```bash
# See what tests are available
npx playwright test --list

# Run with verbose output
npx playwright test --reporter=verbose

# Generate HTML report
npx playwright test --reporter=html

# Show test report
npx playwright show-report
```

## Test Data Requirements

### For Hub Resume Tests
- Valid course UUID in database
- Course must have modules
- Modules must have proper order/progression

### For Quiz Retry Tests
- Quiz questions with multiple choices
- Proper quiz scoring logic (80% pass threshold)
- Retry functionality enabled

## Maintenance

### Updating Tests
When UI changes, update selectors in:
- `tests/hub-resume.spec.ts` - Hub-specific selectors
- `tests/quiz-retry.spec.ts` - Quiz-specific selectors

### Adding New Tests
Follow the pattern:
1. Use descriptive test names
2. Skip gracefully when requirements not met
3. Test both success and error paths
4. Include mobile responsiveness where applicable

### Performance Considerations
- Tests run in parallel by default
- Use `page.waitForLoadState('networkidle')` for dynamic content
- Set appropriate timeouts for slow operations
- Clean up resources after tests
