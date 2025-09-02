// Integration test to verify exam API works with our types
import { generateExam, submitExam } from './client';
import type { ExamPaper, ExamSubmitResult } from './types';

// Type check - this should compile without errors
async function testExamIntegration() {
  try {
    console.log('🧪 Testing Exam API Integration...');

    // Test generateExam with proper typing
    const examPaper: ExamPaper = await generateExam('en');
    console.log('✅ Exam generated:', {
      id: examPaper.id,
      locale: examPaper.locale,
      itemCount: examPaper.items.length,
      meta: examPaper.meta
    });

    // Verify ExamPaper structure
    if (!examPaper.id || !examPaper.locale || !Array.isArray(examPaper.items)) {
      throw new Error('Invalid ExamPaper structure');
    }

    // Create mock answers (random selections)
    const mockAnswers = examPaper.items.map(() => Math.floor(Math.random() * 4));

    // Test submitExam with proper typing
    const result: ExamSubmitResult = await submitExam({
      session_id: examPaper.session_id || 'test-session-id',
      answers: mockAnswers
    });
    
    console.log('✅ Exam submitted:', {
      passed: result.passed,
      score: `${result.scorePct}%`,
      correct: `${result.correct}/${result.total}`,
      reviewCount: result.incorrectIndices.length
    });

    // Verify ExamSubmitResult structure
    if (typeof result.ok !== 'boolean' || 
        typeof result.passed !== 'boolean' ||
        typeof result.scorePct !== 'number' ||
        !Array.isArray(result.incorrectIndices)) {
      throw new Error('Invalid ExamSubmitResult structure');
    }

    console.log('🎯 Exam API integration test completed successfully!');
    return { examPaper, result };

  } catch (error) {
    console.error('❌ Exam API integration test failed:', error);
    throw error;
  }
}

// Export for potential use in actual tests
export { testExamIntegration };
