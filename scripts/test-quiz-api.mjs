#!/usr/bin/env node

/**
 * Simple test script for the quiz module API
 * Usage: node scripts/test-quiz-api.mjs [base_url]
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testQuizAPI() {
  console.log('🧪 Testing Quiz Module API...\n');

  const testCases = [
    { slug: 'pre-operation-inspection', locale: 'en', description: 'English pre-op quiz' },
    { slug: 'pre-operation-inspection', locale: 'es', description: 'Spanish pre-op quiz (with fallback)' },
    { slug: 'eight-point-inspection', locale: 'en', description: 'English 8-point quiz' },
    { slug: 'nonexistent-module', locale: 'en', description: 'Non-existent module (should return empty)' },
  ];

  for (const test of testCases) {
    try {
      const url = `${BASE_URL}/api/quiz/module/${test.slug}?locale=${test.locale}`;
      console.log(`📡 GET ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      console.log(`   ✅ ${test.description} - OK\n`);
      
    } catch (error) {
      console.log(`   ❌ ${test.description} - ERROR: ${error.message}\n`);
    }
  }
  
  console.log('🎯 Quiz API test completed!');
}

testQuizAPI().catch(console.error);
