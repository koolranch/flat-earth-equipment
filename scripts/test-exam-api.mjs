#!/usr/bin/env node

/**
 * Comprehensive test script for the exam API endpoints
 * Usage: node scripts/test-exam-api.mjs [base_url]
 * 
 * Tests both generate and submit endpoints with various scenarios
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testExamAPI() {
  console.log('🧪 Testing Exam API Endpoints...\n');

  // Test 1: Generate Exam (English)
  console.log('📡 Testing POST /api/exam/generate (English)');
  try {
    const generateResponse = await fetch(`${BASE_URL}/api/exam/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', count: 5 })
    });
    
    const examPaper = await generateResponse.json();
    console.log(`   Status: ${generateResponse.status}`);
    console.log(`   Response: ${JSON.stringify(examPaper, null, 2)}`);
    
    if (examPaper.ok && examPaper.id) {
      console.log(`   ✅ Exam generated successfully - Paper ID: ${examPaper.id}\n`);
      
      // Test 2: Submit Exam with mock answers
      console.log('📡 Testing POST /api/exam/submit');
      const mockAnswers = examPaper.items.map(() => Math.floor(Math.random() * 4)); // Random answers 0-3
      
      const submitResponse = await fetch(`${BASE_URL}/api/exam/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: examPaper.id,
          answers: mockAnswers,
          course_id: 'test-course-123'
        })
      });
      
      const submitResult = await submitResponse.json();
      console.log(`   Status: ${submitResponse.status}`);
      console.log(`   Response: ${JSON.stringify(submitResult, null, 2)}`);
      
      if (submitResult.ok) {
        console.log(`   ✅ Exam submitted - Score: ${submitResult.scorePct}% (${submitResult.passed ? 'PASSED' : 'FAILED'})\n`);
      } else {
        console.log(`   ❌ Exam submission failed: ${submitResult.error}\n`);
      }
    } else {
      console.log(`   ❌ Exam generation failed: ${examPaper.error}\n`);
    }
    
  } catch (error) {
    console.log(`   ❌ Exam API test failed: ${error.message}\n`);
  }

  // Test 3: Generate Spanish Exam
  console.log('📡 Testing POST /api/exam/generate (Spanish with fallback)');
  try {
    const spanishResponse = await fetch(`${BASE_URL}/api/exam/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'es', count: 3 })
    });
    
    const spanishExam = await spanishResponse.json();
    console.log(`   Status: ${spanishResponse.status}`);
    console.log(`   Locale returned: ${spanishExam.locale}`);
    console.log(`   Items count: ${spanishExam.meta?.count || 0}`);
    console.log(`   ✅ Spanish exam generation test completed\n`);
    
  } catch (error) {
    console.log(`   ❌ Spanish exam test failed: ${error.message}\n`);
  }

  // Test 4: Submit with invalid paper ID
  console.log('📡 Testing POST /api/exam/submit (invalid paper ID)');
  try {
    const invalidResponse = await fetch(`${BASE_URL}/api/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paper_id: 'invalid-paper-id',
        answers: [0, 1, 2],
        course_id: 'test-course'
      })
    });
    
    const invalidResult = await invalidResponse.json();
    console.log(`   Status: ${invalidResponse.status}`);
    console.log(`   Error: ${invalidResult.error}`);
    console.log(`   ✅ Invalid paper ID handling test completed\n`);
    
  } catch (error) {
    console.log(`   ❌ Invalid paper test failed: ${error.message}\n`);
  }

  console.log('🎯 Exam API tests completed!');
}

testExamAPI().catch(console.error);
