#!/usr/bin/env node

/**
 * Test script for the create-test-user admin API
 * Usage: node test-create-user.mjs [--base-url=URL] [--token=TOKEN]
 */

import { randomUUID } from 'node:crypto';

// Parse CLI arguments
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.split('=');
    return [key.replace(/^--/, ''), value || true];
  })
);

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = args['token'] || process.env.ADMIN_EXPORT_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_EXPORT_TOKEN not set. Provide via --token= or environment variable.');
  process.exit(1);
}

console.log('🧪 Testing create-test-user API');
console.log('----------------------------------');
console.log('BASE_URL:', BASE_URL);
console.log('Token:', ADMIN_TOKEN ? '✅ Set' : '❌ Missing');
console.log('');

async function testAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN,
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', response.status);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.status);
      console.log(JSON.stringify(data, null, 2));
    }
    
    return { response, data };
  } catch (error) {
    console.log('💥 Request failed:', error.message);
    return { error };
  }
}

async function runTests() {
  // Test 1: Health check
  console.log('🏥 Test 1: Health Check');
  await testAPI('/api/admin/dev/create-test-user');
  console.log('');
  
  // Test 2: Create simple user
  console.log('👤 Test 2: Create Simple User');
  const testEmail = `test-${Date.now()}@example.com`;
  await testAPI('/api/admin/dev/create-test-user', {
    method: 'POST',
    body: {
      email: testEmail,
      password: 'test123456'
    }
  });
  console.log('');
  
  // Test 3: Create user with org (if we have test org ID)
  if (args['org-id']) {
    console.log('🏢 Test 3: Create User with Org');
    const orgTestEmail = `org-test-${Date.now()}@example.com`;
    await testAPI('/api/admin/dev/create-test-user', {
      method: 'POST',
      body: {
        email: orgTestEmail,
        password: 'test123456',
        orgId: args['org-id'],
        role: 'learner'
      }
    });
    console.log('');
  }
  
  // Test 4: Create user with org and course (if we have both IDs)
  if (args['org-id'] && args['course-id']) {
    console.log('🎓 Test 4: Create User with Org + Course');
    const fullTestEmail = `full-test-${Date.now()}@example.com`;
    await testAPI('/api/admin/dev/create-test-user', {
      method: 'POST',
      body: {
        email: fullTestEmail,
        password: 'test123456',
        orgId: args['org-id'],
        courseId: args['course-id'],
        role: 'learner',
        redirectTo: `${BASE_URL}/dashboard-simple`
      }
    });
    console.log('');
  }
  
  // Test 5: Invalid token
  console.log('🔒 Test 5: Invalid Token');
  const url = `${BASE_URL}/api/admin/dev/create-test-user`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'invalid-token'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected invalid token');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Should have rejected invalid token');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('💥 Request failed:', error.message);
  }
  
  console.log('');
  console.log('🎉 Test suite completed!');
  console.log('');
  console.log('💡 Usage examples:');
  console.log(`   node test-create-user.mjs --base-url=${BASE_URL}`);
  console.log(`   node test-create-user.mjs --org-id=uuid --course-id=uuid`);
}

runTests().catch(console.error);
