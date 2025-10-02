import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'Missing');

async function importExamQuestions() {
  console.log('📚 Importing exam questions...');
  
  // Load English exam questions
  const examEN = JSON.parse(
    readFileSync(join(__dirname, '../content/exam/final.en.json'), 'utf-8')
  );
  
  // Load Spanish exam questions  
  const examES = JSON.parse(
    readFileSync(join(__dirname, '../content/exam/final.es.json'), 'utf-8')
  );
  
  const questionsToInsert = [];
  
  // Process English questions
  for (const q of examEN.bank) {
    const choices = q.options.map(opt => opt.label);
    const answerLetter = q.answer;
    const correct_index = q.options.findIndex(opt => opt.id === answerLetter);
    
    questionsToInsert.push({
      module_slug: 'final-exam',
      locale: 'en',
      question: q.prompt,
      choices: choices,
      correct_index: correct_index,
      explain: q.explain || null,
      difficulty: 3, // Default medium difficulty
      tags: ['exam'], // Tag as exam question
      is_exam_candidate: true,
      active: true,
      status: 'published',
      source: 'content/exam/final.en.json',
      version: 1
    });
  }
  
  // Process Spanish questions
  for (const q of examES.bank) {
    const choices = q.options.map(opt => opt.label);
    const answerLetter = q.answer;
    const correct_index = q.options.findIndex(opt => opt.id === answerLetter);
    
    questionsToInsert.push({
      module_slug: 'final-exam',
      locale: 'es',
      question: q.prompt,
      choices: choices,
      correct_index: correct_index,
      explain: q.explain || null,
      difficulty: 3,
      tags: ['exam'],
      is_exam_candidate: true,
      active: true,
      status: 'published',
      source: 'content/exam/final.es.json',
      version: 1
    });
  }
  
  console.log(`📝 Inserting ${questionsToInsert.length} questions (${examEN.bank.length} EN + ${examES.bank.length} ES)...`);
  
  // Insert all questions
  const { data, error } = await supabase
    .from('quiz_items')
    .insert(questionsToInsert)
    .select('id');
  
  if (error) {
    console.error('❌ Error inserting questions:', error);
    process.exit(1);
  }
  
  console.log(`✅ Successfully imported ${data.length} exam questions!`);
  console.log('🎯 Exam is now ready to be taken.');
}

importExamQuestions().catch(console.error);

