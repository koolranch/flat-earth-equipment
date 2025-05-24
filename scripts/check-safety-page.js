#!/usr/bin/env node

/**
 * Simple checks for the safety page without requiring Chrome
 */

async function checkSafetyPage() {
  const url = process.argv[2] || 'http://localhost:3000/safety';
  console.log(`🔍 Checking safety page at: ${url}\n`);

  try {
    // Fetch the page
    const response = await fetch(url);
    const html = await response.text();

    const issues = [];
    const successes = [];

    // Check for aria-labels on key elements
    if (html.includes('aria-label="Start forklift certification checkout"')) {
      successes.push('✅ Checkout button has proper aria-label');
    } else {
      issues.push('❌ Missing aria-label on checkout button');
    }

    // Check for meta tags
    if (html.includes('<meta name="description"')) {
      successes.push('✅ Meta description present');
    } else {
      issues.push('❌ Missing meta description');
    }

    // Check for preconnect to Mux
    if (html.includes('rel="preconnect" href="https://stream.mux.com"')) {
      successes.push('✅ Preconnect to Mux CDN present');
    } else {
      issues.push('❌ Missing preconnect to Mux');
    }

    // Check for Inter font CSS variable
    if (html.includes('__className_')) {
      successes.push('✅ Next/font optimization active');
    } else {
      issues.push('❌ Next/font may not be working');
    }

    // Check for structured data
    if (html.includes('application/ld+json')) {
      successes.push('✅ Structured data (JSON-LD) present');
    } else {
      issues.push('❌ Missing structured data');
    }

    // Check for transcript links
    if (html.includes('/transcripts/')) {
      successes.push('✅ Transcript links present');
    }

    // Check text contrast on orange buttons
    if (html.includes('bg-orange-600') && html.includes('text-white')) {
      successes.push('✅ Orange buttons have white text for contrast');
    }

    // Print results
    console.log('SUCCESSES:');
    successes.forEach(s => console.log(s));
    
    if (issues.length > 0) {
      console.log('\nISSUES TO FIX:');
      issues.forEach(i => console.log(i));
    } else {
      console.log('\n🎉 No critical issues found!');
    }

    console.log('\n📊 Score:', successes.length, '/', (successes.length + issues.length));

  } catch (error) {
    console.error('❌ Error checking page:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
  }
}

checkSafetyPage(); 