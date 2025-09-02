import dotenv from 'dotenv';
// Load from .env.local as per project convention
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
if (!url || !key) throw new Error('Missing Supabase env');
const svc = createClient(url, key);

const seed = [
  { module_slug:'pre-operation-inspection', q:'Which item goes on first?', choices:['Hard hat','High-visibility vest','Lower forks','Set brake'], correct_index:1, explain:'Vest on first, then hard hat.', tags:['m1','ppe'], is_exam_candidate:true },
  { module_slug:'pre-operation-inspection', q:'Which control should be set before dismounting?', choices:['Throttle','Brake','Horn','Lift'], correct_index:1, explain:'Set the brake before dismounting.', tags:['m1'], is_exam_candidate:true },
  { module_slug:'eight-point-inspection', q:'If you find a hydraulic leak, you should…', choices:['Wipe and continue','Tag out and report','Ignore if small','Speed up'], correct_index:1, explain:'Report and remove from service.', tags:['m2'], is_exam_candidate:true },
  { module_slug:'eight-point-inspection', q:'Seat belt check belongs to…', choices:['Travel section','Pre-op inspection','Shutdown only','Not required'], correct_index:1, explain:'Seat belt is part of pre-op.', tags:['m2'], is_exam_candidate:false }
];

async function run(){
  console.log('🌱 Seeding quiz items for M1 & M2...\n');
  
  // Note: quiz_items table should be created via migration first
  console.log('📋 If you get insertion errors, run the migration:');
  console.log('   supabase migration up supabase/migrations/create_quiz_items_table.sql\n');
  
  for (const s of seed){
    console.log(`📝 Adding: ${s.q.substring(0, 50)}...`);
    
    // Insert English version
    const { data: en, error: enError } = await svc.from('quiz_items').insert({
      module_slug: s.module_slug,
      locale: 'en', 
      question: s.q, 
      choices: s.choices, 
      correct_index: s.correct_index, 
      explain: s.explain,
      tags: s.tags, 
      is_exam_candidate: s.is_exam_candidate, 
      active: true,
      source: 'seed'
    }).select('id');
    
    if (enError) {
      console.log(`   ❌ EN failed: ${enError.message}`);
      console.log(`   Details: ${JSON.stringify(enError, null, 2)}`);
      continue;
    }
    
    if (en && en[0]){
      console.log(`   ✅ EN inserted: ${en[0].id}`);
      
      // Insert Spanish stub (same content for now)
      const { data: es, error: esError } = await svc.from('quiz_items').insert({
        module_slug: s.module_slug,
        locale: 'es', 
        question: s.q, 
        choices: s.choices, 
        correct_index: s.correct_index, 
        explain: s.explain,
        tags: s.tags, 
        is_exam_candidate: s.is_exam_candidate, 
        active: true,
        source: 'seed'
      }).select('id');
      
      if (esError) {
        console.log(`   ❌ ES failed: ${esError.message}`);
      } else if (es && es[0]) {
        console.log(`   ✅ ES inserted: ${es[0].id}`);
      }
    }
    console.log('');
  }
  
  console.log('🎯 Seed complete! Quiz items ready for testing.');
  
  // Show summary
  const { data: summary } = await svc
    .from('quiz_items')
    .select('module_slug, locale, count(*)')
    .in('module_slug', ['pre-operation-inspection', 'eight-point-inspection'])
    .eq('active', true);
    
  if (summary) {
    console.log('\n📊 Summary:');
    summary.forEach(row => {
      console.log(`   ${row.module_slug} (${row.locale}): ${row.count} items`);
    });
  }
}

run().catch(console.error);
