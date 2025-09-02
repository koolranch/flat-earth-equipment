#!/usr/bin/env node

/**
 * Test script for the admin quiz import API
 * Usage: node scripts/test-quiz-import-api.mjs [base_url]
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

// Sample import data
const testData = {
  dryRun: true,
  rows: [
    {
      module_slug: 'pre-operation-inspection',
      locale: 'en',
      question: 'Test question 1?',
      choice_0: 'Option A',
      choice_1: 'Option B',
      choice_2: 'Option C',
      correct_index: '1',
      explain: 'Option B is correct.',
      difficulty: '2',
      tags: 'test,import',
      is_exam_candidate: 'true',
      active: 'true'
    },
    {
      module_slug: 'eight-point-inspection',
      locale: 'es',
      question: '¿Pregunta de prueba 2?',
      choice_0: 'Opción A',
      choice_1: 'Opción B',
      correct_index: '0',
      explain: 'La opción A es correcta.',
      difficulty: '1',
      tags: 'test,import,spanish',
      is_exam_candidate: 'false',
      active: 'true'
    },
    {
      // Invalid row - missing question
      module_slug: 'test-module',
      locale: 'en',
      choice_0: 'Choice A',
      choice_1: 'Choice B',
      correct_index: '0'
    }
  ]
};

async function testImportAPI() {
  console.log('🧪 Testing Quiz Import API...\n');

  try {
    console.log('📡 POST /api/admin/quiz/import (dry run)');
    const response = await fetch(`${BASE_URL}/api/admin/quiz/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('   ❌ Unauthorized - authentication required');
      return;
    }
    
    if (response.status === 403) {
      console.log('   ❌ Forbidden - trainer/admin role required');
      return;
    }
    
    if (response.status === 500) {
      console.log('   ❌ Server error - likely quiz_items table does not exist');
      return;
    }
    
    const result = await response.json();
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
    
    if (result.ok) {
      console.log(`   ✅ Import processed:`);
      console.log(`      Inserted: ${result.inserted.length}`);
      console.log(`      Skipped: ${result.skipped.length}`);
      console.log(`      Errors: ${result.errors.length}`);
      console.log(`      Dry run: ${result.dryRun}`);
      
      if (result.errors.length > 0) {
        console.log('\n   📋 Validation errors:');
        result.errors.forEach((err, i) => {
          console.log(`      ${i + 1}. Row ${err.index}: ${err.error}`);
        });
      }
    } else {
      console.log(`   ❌ Import failed: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
  }

  console.log('\n🎯 Quiz import API test completed!');
}

testImportAPI().catch(console.error);
