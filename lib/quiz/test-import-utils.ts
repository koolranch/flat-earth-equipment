// Test file for import utilities
import { QUIZ_CSV_HEADER, normalizeRow, contentHash, type RawRow, type ImportRow } from './import-utils';

// Test CSV header
console.log('CSV Header:', QUIZ_CSV_HEADER);

// Test data
const testRows: RawRow[] = [
  {
    module_slug: 'pre-operation-inspection',
    locale: 'en',
    question: 'Which item goes on first?',
    choice_0: 'Hard hat',
    choice_1: 'High-visibility vest',
    choice_2: 'Lower forks',
    choice_3: 'Set brake',
    correct_index: '1',
    explain: 'Vest on first, then hard hat.',
    difficulty: '2',
    tags: 'm1,ppe,safety',
    is_exam_candidate: 'true',
    active: 'true'
  },
  {
    module_slug: '',  // Invalid - missing module_slug
    locale: 'en',
    question: 'Test question',
    choice_0: 'Choice A',
    choice_1: 'Choice B',
    correct_index: '0'
  },
  {
    module_slug: 'eight-point-inspection',
    locale: 'invalid', // Invalid locale
    question: 'Test question',
    choice_0: 'Choice A',
    choice_1: 'Choice B',
    correct_index: '0'
  }
];

// Test normalizeRow function
console.log('\nTesting normalizeRow:');
testRows.forEach((row, index) => {
  const result = normalizeRow(row);
  console.log(`Row ${index + 1}:`, result.ok ? '✅ Valid' : `❌ ${result.error}`);
  
  if (result.ok) {
    console.log(`  Module: ${result.row.module_slug}`);
    console.log(`  Locale: ${result.row.locale}`);
    console.log(`  Question: ${result.row.question.substring(0, 30)}...`);
    console.log(`  Choices: ${result.row.choices.length} items`);
    console.log(`  Correct: ${result.row.correct_index}`);
    console.log(`  Tags: ${result.row.tags?.join(', ') || 'none'}`);
    console.log(`  Exam candidate: ${result.row.is_exam_candidate}`);
    
    // Test content hash
    const hash = contentHash(result.row);
    console.log(`  Content hash: ${hash.substring(0, 16)}...`);
  }
  console.log('');
});

// Test hash consistency
const validRow = normalizeRow(testRows[0]);
if (validRow.ok) {
  const hash1 = contentHash(validRow.row);
  const hash2 = contentHash(validRow.row);
  console.log(`Hash consistency test: ${hash1 === hash2 ? '✅ Same' : '❌ Different'}`);
}

export { QUIZ_CSV_HEADER, normalizeRow, contentHash };
