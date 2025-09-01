#!/usr/bin/env node

/**
 * Test script for the certificate verification endpoint
 * Usage: node scripts/test-verify-endpoint.mjs [verification_code]
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_CODE = process.argv[2] || process.env.TEST_VERIFICATION_CODE;

async function testVerifyEndpoint() {
  console.log('🔍 Testing Certificate Verification Endpoint...');
  console.log(`📍 Base URL: ${BASE_URL}`);

  // Test 1: Missing verification code
  console.log('\n📝 Test 1: Missing verification code');
  try {
    const response = await fetch(`${BASE_URL}/api/verify/`);
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('✅ Correctly returns 404 for missing code (route not found)');
    } else {
      const data = await response.json();
      console.log('📋 Response:', data);
    }
  } catch (error) {
    console.log('⚠️  Expected error for missing route:', error.message);
  }

  // Test 2: Empty verification code
  console.log('\n📝 Test 2: Empty verification code');
  try {
    const response = await fetch(`${BASE_URL}/api/verify/`);
    console.log(`📊 Status: ${response.status}`);
    
    const data = await response.json().catch(() => null);
    if (data) {
      console.log('📋 Response:', data);
    }
  } catch (error) {
    console.log('⚠️  Network error:', error.message);
  }

  // Test 3: Invalid verification code
  console.log('\n📝 Test 3: Invalid verification code');
  try {
    const response = await fetch(`${BASE_URL}/api/verify/invalid-code-12345`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📋 Response:', data);
    
    if (response.status === 404 && !data.found) {
      console.log('✅ Correctly returns 404 for invalid code');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Test 4: Valid verification code (if provided)
  if (TEST_CODE) {
    console.log(`\n📝 Test 4: Valid verification code (${TEST_CODE})`);
    try {
      const response = await fetch(`${BASE_URL}/api/verify/${TEST_CODE}`);
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 200 && data.found) {
        console.log('✅ Successfully verified certificate');
        
        // Validate required fields
        const requiredFields = ['code', 'learner', 'course_title', 'issued_at', 'expires_at'];
        const missingFields = requiredFields.filter(field => !(field in data));
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields present');
        } else {
          console.log('⚠️  Missing fields:', missingFields);
        }
        
        // Check learner object
        if (data.learner && typeof data.learner === 'object') {
          console.log('✅ Learner object present');
          if (data.learner.name || data.learner.email) {
            console.log('✅ Learner has name or email');
          }
        }
        
        // Check dates
        if (data.issued_at && data.expires_at) {
          const issued = new Date(data.issued_at);
          const expires = new Date(data.expires_at);
          const diffYears = (expires - issued) / (1000 * 60 * 60 * 24 * 365);
          
          if (Math.abs(diffYears - 3) < 0.1) {
            console.log('✅ Expiry date is ~3 years from issue date');
          } else {
            console.log('⚠️  Unexpected expiry calculation:', diffYears, 'years');
          }
        }
        
        // Check practical evaluation
        if (data.practical_pass !== undefined) {
          console.log(`✅ Practical evaluation status: ${data.practical_pass}`);
        }
        
      } else if (response.status === 404) {
        console.log('⚠️  Certificate not found in database');
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
  } else {
    console.log('\n📝 Test 4: Skipped (no verification code provided)');
    console.log('💡 Provide a verification code as argument or set TEST_VERIFICATION_CODE env var');
  }

  // Test 5: Cache headers
  console.log('\n📝 Test 5: Cache control headers');
  try {
    const response = await fetch(`${BASE_URL}/api/verify/test-cache-headers`);
    const cacheControl = response.headers.get('cache-control');
    
    if (cacheControl?.includes('no-store')) {
      console.log('✅ Correct cache-control header present');
    } else {
      console.log('⚠️  Expected no-store cache-control header');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🏁 Certificate verification endpoint tests completed');
}

// Run the tests
testVerifyEndpoint().catch(console.error);
