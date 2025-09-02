#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🌍 i18n Audit Report');
console.log('==================');

try {
  // Load dictionaries
  const enPath = join(process.cwd(), 'lib/i18n/locales/en.ts');
  const esPath = join(process.cwd(), 'lib/i18n/locales/es.ts');
  
  const enContent = readFileSync(enPath, 'utf-8');
  const esContent = readFileSync(esPath, 'utf-8');
  
  // Extract keys from EN dictionary
  const enKeys = extractKeys(enContent);
  const esKeys = extractKeys(esContent);
  
  console.log(`\n📊 Translation Coverage:`);
  console.log(`EN keys: ${enKeys.size}`);
  console.log(`ES keys: ${esKeys.size}`);
  console.log(`Coverage: ${Math.round((esKeys.size / enKeys.size) * 100)}%`);
  
  // Find missing keys
  const missingInES = Array.from(enKeys).filter(key => !esKeys.has(key));
  const extraInES = Array.from(esKeys).filter(key => !enKeys.has(key));
  
  if (missingInES.length > 0) {
    console.log(`\n❌ Missing in ES (${missingInES.length}):`);
    missingInES.forEach(key => console.log(`  - ${key}`));
  }
  
  if (extraInES.length > 0) {
    console.log(`\n⚠️  Extra in ES (${extraInES.length}):`);
    extraInES.forEach(key => console.log(`  - ${key}`));
  }
  
  if (missingInES.length === 0 && extraInES.length === 0) {
    console.log('\n✅ Perfect translation parity!');
  }
  
  // Check for common sections
  const sections = ['common', 'training', 'exam', 'records', 'verify', 'eval', 'trainer', 'games', 'errors'];
  console.log(`\n📁 Dictionary Sections:`);
  sections.forEach(section => {
    const enHas = enKeys.has(section);
    const esHas = esKeys.has(section);
    console.log(`  ${enHas && esHas ? '✅' : '❌'} ${section}: EN=${enHas} ES=${esHas}`);
  });
  
} catch (error) {
  console.error('❌ Audit failed:', error.message);
  process.exit(1);
}

function extractKeys(content) {
  const keys = new Set();
  
  // Extract top-level object keys
  const matches = content.match(/(\w+):\s*{/g);
  if (matches) {
    matches.forEach(match => {
      const key = match.replace(/:\s*{/, '');
      keys.add(key);
    });
  }
  
  return keys;
}
