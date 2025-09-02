// Simple test file to verify client functions work
import { fetchModuleQuiz, generateExam, submitExam } from './client';
import type { ExamPaper, ExamSubmitResult } from './types';

// Type check - this should compile without errors
async function testClientFunctions() {
  try {
    // Test fetchModuleQuiz
    const moduleQuiz = await fetchModuleQuiz('pre-operation-inspection', 'en');
    console.log('Module quiz loaded:', typeof moduleQuiz);

    // Test generateExam with proper typing
    const examPaper: ExamPaper = await generateExam('en');
    console.log('Exam generated:', examPaper.id, examPaper.items.length);

    // Test submitExam with proper typing
    const result: ExamSubmitResult = await submitExam({
      session_id: examPaper.session_id || 'test-session-id',
      answers: [0, 1, 2] // example answers
    });
    console.log('Exam submitted:', result.passed, result.scorePct);

  } catch (error) {
    console.log('Expected errors in test environment:', error);
  }
}

// Export for potential use in actual tests
export { testClientFunctions };
