// Test script for progress helper (for development/debugging)
// Usage: tsx lib/learner/test-progress.ts

import { getCourseProgress } from './progress.server';

async function testProgress() {
  try {
    // Test with a sample course ID (replace with actual course ID from your DB)
    const courseId = 'sample-course-id';
    const progress = await getCourseProgress(courseId);
    
    console.log('Course Progress:', {
      percentage: progress.pct,
      stepsLeft: progress.stepsLeft.length,
      nextStep: progress.next,
      allSteps: progress.stepsLeft
    });
  } catch (error) {
    console.error('Progress test failed:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  testProgress();
}
