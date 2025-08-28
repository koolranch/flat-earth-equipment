// Test script for quiz attempts helper (for development/debugging)
// Usage: tsx lib/quiz/test-attempts.ts

import { startAttempt, finishAttempt } from './attempts.server';

async function testQuizAttempts() {
  try {
    // Test starting an attempt
    const startInput = {
      courseId: 'sample-course-id',
      moduleId: 'sample-module-id',
      poolIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
      take: 3,
      mode: 'full' as const
    };
    
    console.log('Starting quiz attempt...');
    const { attemptId, order } = await startAttempt(startInput);
    console.log('Started attempt:', { attemptId, questionOrder: order });
    
    // Test finishing an attempt (simulate 2 out of 3 correct)
    const correctIds = order.slice(0, 2); // First 2 questions correct
    console.log('Finishing attempt with correct answers:', correctIds);
    
    const result = await finishAttempt(attemptId, correctIds);
    console.log('Attempt result:', result);
    
  } catch (error) {
    console.error('Quiz attempt test failed:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  testQuizAttempts();
}
