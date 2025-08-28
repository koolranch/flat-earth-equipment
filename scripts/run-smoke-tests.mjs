#!/usr/bin/env node
/**
 * Smoke test runner for hub resume and quiz retry functionality
 * Usage: node scripts/run-smoke-tests.mjs [--base-url=http://localhost:3000] [--course-id=uuid]
 */

import { execSync } from 'node:child_process';

// Parse command line arguments
const args = Object.fromEntries(process.argv.slice(2).map(kv => {
  const [k, v] = kv.split('=');
  return [k.replace(/^--/, ''), v ?? ''];
}));

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const QA_COURSE_ID = args['course-id'] || process.env.QA_COURSE_ID || '';

console.log('🧪 Running Playwright Smoke Tests');
console.log('--------------------------------------------------');
console.log('BASE_URL     =', BASE_URL);
console.log('QA_COURSE_ID =', QA_COURSE_ID || '(not set - some tests will skip)');
console.log('');

// Set environment variables for the test run
const testEnv = {
  ...process.env,
  BASE_URL,
  QA_COURSE_ID
};

try {
  console.log('🎯 Running Hub Resume Tests...');
  execSync('npx playwright test hub-resume.spec.ts --reporter=line', {
    stdio: 'inherit',
    env: testEnv
  });
  
  console.log('');
  console.log('🎮 Running Quiz Retry Tests...');
  execSync('npx playwright test quiz-retry.spec.ts --reporter=line', {
    stdio: 'inherit',
    env: testEnv
  });
  
  console.log('');
  console.log('✅ All smoke tests completed!');
  console.log('');
  console.log('📊 To see detailed results:');
  console.log('   npx playwright show-report');
  
} catch (error) {
  console.error('');
  console.error('❌ Some tests failed or encountered errors');
  console.error('');
  console.error('🔍 Debugging tips:');
  console.error('   1. Ensure server is running at', BASE_URL);
  console.error('   2. Check if QA_COURSE_ID is valid:', QA_COURSE_ID || '(not provided)');
  console.error('   3. Run with --headed to see browser: npx playwright test --headed');
  console.error('   4. Check test results: npx playwright show-report');
  
  process.exit(1);
}
