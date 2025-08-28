// Test script for quiz pooling functionality
// Usage: tsx test-quiz-pooling.ts

async function testQuizPooling() {
  console.log('🧪 Testing Quiz Pooling API\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Start a quiz attempt
    console.log('Test 1: Starting quiz attempt...');
    const startResponse = await fetch(`${baseUrl}/api/quiz/attempts/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: 'test-module-123',
        poolIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
        take: 3,
        mode: 'full'
      })
    });

    if (!startResponse.ok) {
      throw new Error(`Start attempt failed: ${startResponse.status} ${startResponse.statusText}`);
    }

    const startResult = await startResponse.json();
    console.log('✅ Start attempt result:', startResult);
    
    const { attemptId, order } = startResult;
    
    if (!attemptId || !Array.isArray(order)) {
      throw new Error('Invalid start attempt response structure');
    }

    // Test 2: Finish the quiz attempt
    console.log('\nTest 2: Finishing quiz attempt...');
    const correctIds = order.slice(0, 2); // Simulate 2 out of 3 correct
    
    const finishResponse = await fetch(`${baseUrl}/api/quiz/attempts/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        correctIds
      })
    });

    if (!finishResponse.ok) {
      throw new Error(`Finish attempt failed: ${finishResponse.status} ${finishResponse.statusText}`);
    }

    const finishResult = await finishResponse.json();
    console.log('✅ Finish attempt result:', finishResult);
    
    const { score, incorrect, passed } = finishResult;
    
    if (typeof score !== 'number' || !Array.isArray(incorrect) || typeof passed !== 'boolean') {
      throw new Error('Invalid finish attempt response structure');
    }

    // Test 3: Start a retry attempt with incorrect questions
    if (incorrect.length > 0) {
      console.log('\nTest 3: Starting retry attempt...');
      const retryResponse = await fetch(`${baseUrl}/api/quiz/attempts/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'test-module-123',
          poolIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
          take: incorrect.length,
          mode: 'retry',
          retryIds: incorrect
        })
      });

      if (!retryResponse.ok) {
        throw new Error(`Retry attempt failed: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const retryResult = await retryResponse.json();
      console.log('✅ Retry attempt result:', retryResult);
    }

    console.log('\n🎉 All quiz pooling tests passed!');
    
  } catch (error) {
    console.error('\n❌ Quiz pooling test failed:', error);
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  testQuizPooling();
}

export { testQuizPooling };
